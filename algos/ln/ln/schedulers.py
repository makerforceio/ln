import os
import json
import logging
from os.path import join, exists

from scrapy.utils.reqser import request_to_dict, request_from_dict
from scrapy.utils.misc import load_object
from scrapy.utils.job import job_dir

logger = logging.getLogger(__name__)

import numpy as np
from numpy.random import choice

import time

class ProximityScheduler(object):

    def __init__(self, dupefilter, jobdir=None, dqclass=None, mqclass=None,
                 logunser=False, stats=None, pqclass=None):
        self.df = dupefilter
        self.start_key = None
        self.proximity_graph = {}
        self.requests = {}
        self.length = 0
        self.logunser = logunser
        self.stats = stats

    @classmethod
    def from_crawler(cls, crawler):
        settings = crawler.settings
        dupefilter_cls = load_object(settings['DUPEFILTER_CLASS'])
        if hasattr(dupefilter_cls, 'from_crawler'):
            dupefilter = dupefilter_cls.from_crawler(crawler)
        elif hasattr(dupefilter_cls, 'from_settings'):
            dupefilter = dupefilter_cls.from_settings(crawler.settings)
        else:
            dupefilter = dupefilter_cls()
        logunser = settings.getbool('LOG_UNSERIALIZABLE_REQUESTS', settings.getbool('SCHEDULER_DEBUG'))
        return cls(dupefilter, jobdir=job_dir(settings), logunser=logunser,
                   stats=crawler.stats)

    def has_pending_requests(self):
        return len(self) > 0

    def open(self, spider):
        self.spider = spider
        return self.df.open()

    def close(self, reason):
        return self.df.close(reason)

    def enqueue_request(self, request):
        if len(self.proximity_graph) == 0:
            self.start_key = request.url
        if request.headers.get(b'Referer') is not None:
            referer = request.headers.get(b'Referer').decode('ASCII')
            if self.proximity_graph[referer] == -1:
                self.proximity_graph[referer] = {}
            self.proximity_graph[referer][request.url] = self.proximity_graph[referer].get(request.url, 0) + request.meta["weight"]
        if self.proximity_graph.get(request.url) is None:
            self.requests[request.url] = request
            self.proximity_graph[request.url] = -2
        else:
            return False
        self.stats.inc_value('scheduler/enqueued', spider=self.spider)
        return True

    def next_request(self):
        time.sleep(1)
        if len(self) <= 0:
            return
        parent_key = None
        key = self.start_key
        while True:
            request_list = self.proximity_graph[key]
            if request_list == -2:
                self.proximity_graph[key] = -1
                request = self.requests[key]
                del self.requests[key]
                return request
            elif request_list == -1:
                if parent_key is not None:
                    key = parent_key
                else:
                    return
            elif sum(request_list.values()) == 0:
                self.proximity_graph[parent_key][key] = 0
                return
            else:
                p = np.array([v for v in request_list.values()])
                p = p / sum(p)
                key = choice([k for k in request_list.keys()], p=p)

    def __len__(self):
        return len(self.requests)

class Scheduler(object):

    def __init__(self, dupefilter, jobdir=None, dqclass=None, mqclass=None,
                 logunser=False, stats=None, pqclass=None):
        self.df = dupefilter
        self.dqdir = self._dqdir(jobdir)
        self.pqclass = pqclass
        self.dqclass = dqclass
        self.mqclass = mqclass
        self.logunser = logunser
        self.stats = stats

    @classmethod
    def from_crawler(cls, crawler):
        settings = crawler.settings
        dupefilter_cls = load_object(settings['DUPEFILTER_CLASS'])
        if hasattr(dupefilter_cls, 'from_crawler'):
            dupefilter = dupefilter_cls.from_crawler(crawler)
        elif hasattr(dupefilter_cls, 'from_settings'):
            dupefilter = dupefilter_cls.from_settings(crawler.settings)
        else:
            dupefilter = dupefilter_cls()
        pqclass = load_object(settings['SCHEDULER_PRIORITY_QUEUE'])
        dqclass = load_object(settings['SCHEDULER_DISK_QUEUE'])
        mqclass = load_object(settings['SCHEDULER_MEMORY_QUEUE'])
        logunser = settings.getbool('LOG_UNSERIALIZABLE_REQUESTS', settings.getbool('SCHEDULER_DEBUG'))
        return cls(dupefilter, jobdir=job_dir(settings), logunser=logunser,
                   stats=crawler.stats, pqclass=pqclass, dqclass=dqclass, mqclass=mqclass)

    def has_pending_requests(self):
        return len(self) > 0

    def open(self, spider):
        self.spider = spider
        self.mqs = self.pqclass(self._newmq)
        self.dqs = self._dq() if self.dqdir else None
        return self.df.open()

    def close(self, reason):
        if self.dqs:
            prios = self.dqs.close()
            with open(join(self.dqdir, 'active.json'), 'w') as f:
                json.dump(prios, f)
        return self.df.close(reason)

    def enqueue_request(self, request):
        if not request.dont_filter and self.df.request_seen(request):
            self.df.log(request, self.spider)
            return False
        print(request.headers.get(b'Referer'))
        dqok = self._dqpush(request)
        if dqok:
            self.stats.inc_value('scheduler/enqueued/disk', spider=self.spider)
        else:
            self._mqpush(request)
            self.stats.inc_value('scheduler/enqueued/memory', spider=self.spider)
        self.stats.inc_value('scheduler/enqueued', spider=self.spider)
        return True

    def next_request(self):
        request = self.mqs.pop()
        if request:
            self.stats.inc_value('scheduler/dequeued/memory', spider=self.spider)
        else:
            request = self._dqpop()
            if request:
                self.stats.inc_value('scheduler/dequeued/disk', spider=self.spider)
        if request:
            self.stats.inc_value('scheduler/dequeued', spider=self.spider)
        return request

    def __len__(self):
        return len(self.dqs) + len(self.mqs) if self.dqs else len(self.mqs)

    def _dqpush(self, request):
        if self.dqs is None:
            return
        try:
            reqd = request_to_dict(request, self.spider)
            self.dqs.push(reqd, -request.priority)
        except ValueError as e:  # non serializable request
            if self.logunser:
                msg = ("Unable to serialize request: %(request)s - reason:"
                       " %(reason)s - no more unserializable requests will be"
                       " logged (stats being collected)")
                logger.warning(msg, {'request': request, 'reason': e},
                               exc_info=True, extra={'spider': self.spider})
                self.logunser = False
            self.stats.inc_value('scheduler/unserializable',
                                 spider=self.spider)
            return
        else:
            return True

    def _mqpush(self, request):
        self.mqs.push(request, -request.priority)

    def _dqpop(self):
        if self.dqs:
            d = self.dqs.pop()
            if d:
                return request_from_dict(d, self.spider)

    def _newmq(self, priority):
        return self.mqclass()

    def _newdq(self, priority):
        return self.dqclass(join(self.dqdir, 'p%s' % priority))

    def _dq(self):
        activef = join(self.dqdir, 'active.json')
        if exists(activef):
            with open(activef) as f:
                prios = json.load(f)
        else:
            prios = ()
        q = self.pqclass(self._newdq, startprios=prios)
        if q:
            logger.info("Resuming crawl (%(queuesize)d requests scheduled)",
                        {'queuesize': len(q)}, extra={'spider': self.spider})
        return q

    def _dqdir(self, jobdir):
        if jobdir:
            dqdir = join(jobdir, 'requests.queue')
            if not exists(dqdir):
                os.makedirs(dqdir)
            return dqdir
