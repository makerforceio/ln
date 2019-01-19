# -*- coding: utf-8 -*-
import scrapy

import pydgraph as dg

import re

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

        page_name = response.url.split("/")[-1]

        obj = {
            "uid": "_:obj",
            "name": page_name
        }

        parent = response.meta.get("parent")

        txn = self.client.txn()
        try:
            uid = txn.mutate(set_obj=obj).uids['obj']
            if parent is not None:
                weight = response.meta.get('weight')
                txn.mutate(set_nquads="<{}> <link> <{}> (weight={}) .".format(parent, uid, weight))
                # txn.mutate(set_nquads="<{}> <link@reverse> <{}> (weight={}) .".format(uid, parent, weight))
        finally:
            txn.commit()
            txn.discard()

        meta = {"search_depth": depth, "parent": uid, "weight": self.hatnote_weight}

        content = response.css("div#bodyContent")[0]
        
        hatnotes = content.css("div.hatnote").css("a::attr(href)").extract()

        visited_urls = []

        pattern = re.compile("\/wiki/(?!(.*:.*)).*")

        for hatnote in hatnotes:
            if hatnote in visited_urls:
                continue
            visited_urls.append(hatnote)

            client.query

            if pattern.fullmatch(hatnote) is not None:
                yield response.follow(hatnote, callback=self.parse, meta=meta)

        meta = {"search_depth": depth, "parent": uid, "weight": self.normal_weight}
        
        other_links = content.css("a::attr(href)").extract()

        for link in other_links:
            if link in visited_urls:
                continue
            visited_urls.append(link)

            if pattern.fullmatch(link) is not None:
                yield response.follow(link, callback=self.parse, meta=meta)

        return
