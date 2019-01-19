# -*- coding: utf-8 -*-
import scrapy

import pydgraph as dg

import re

import json

class WikipediaSpider(scrapy.Spider):
    name = 'wikipedia'

    client_stub = dg.DgraphClientStub("localhost:9080")
    client = dg.DgraphClient(client_stub)
    
    def __init__(self, start=None, *args, **kwargs):
        super(WikipediaSpider, self).__init__(*args, **kwargs)
        self.start_urls = ['https://en.wikipedia.org/wiki/%s' % start]

        self.normal_weight = 1
        self.hatnote_weight = 5

        self.max_depth = 2

    def parse(self, response):
        depth = response.meta.get("search_depth", self.max_depth)
        if depth <= 0:
            return
        depth -= 1

        uid = response.meta.get("uid", None)
        if uid is None:
            txn = self.client.txn()
            try:
                page_name = response.url.split("/")[-1]

                uid = self.get_node(txn, page_name)

                title = response.css("h1#firstHeading::text")[0].extract()
                txn.mutate(set_nquads="<{}> <title@en> \"{}\" .".format(uid, title))
                txn.commit()
            finally:
                txn.discard()

        
        content = response.css("div#bodyContent")[0]
        
        hatnotes = content.css("div.hatnote").css("a::attr(href)").extract()

        visited_urls = []

        pattern = re.compile("\/wiki/(?!(.*:.*)).*")
    
        for hatnote in hatnotes:
            meta = self.get_meta(hatnote, visited_urls, pattern, uid, depth, self.hatnote_weight)
            if meta is not None:
                yield response.follow(hatnote, callback=self.parse, meta=meta)

        other_links = content.css("a::attr(href)").extract()

        for link in other_links:
            meta = self.get_meta(link, visited_urls, pattern, uid, depth, self.hatnote_weight)
            if meta is not None:
                yield response.follow(link, callback=self.parse, meta=meta)
            
        return

    def get_node(self, txn, page_name):
        uid = txn.query(('{find(func: eq(name, \"%s\")){uid}}') % page_name)
        uid = json.loads(uid.json)['find']
        if len(uid) != 0:
            uid = uid[0]['uid']
        else:
            obj = {
                "uid": "_:obj",
                "name": page_name
            }
            
            uid = txn.mutate(set_obj=obj).uids['obj']

        return uid

    def link(self, txn, parent, child, weight):
        txn.mutate(set_nquads="<{}> <link> <{}> (weight={}) .".format(parent, child, weight))
        # txn.mutate(set_nquads="<{}> <link@reverse> <{}> (weight={}) .".format(uid, parent, weight))

    def get_meta(self, ref, visited_urls, pattern, uid, depth, weight):
        if ref in visited_urls:
            return None
        visited_urls.append(ref)

        if pattern.fullmatch(ref) is not None:
            child_name = ref.split("/")[-1]
            
            txn = self.client.txn()
            child_uid = None
            try:
                child_uid = self.get_node(txn, child_name)

                self.link(txn, uid, child_uid, weight)
                txn.commit()
            finally:
                txn.discard()

            meta = {"search_depth": depth, "uid": child_uid, "weight": weight}
            return meta

        return None
