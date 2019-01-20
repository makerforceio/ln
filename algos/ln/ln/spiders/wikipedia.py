# -*- coding: utf-8 -*-
import scrapy

import re

class WikipediaSpider(scrapy.Spider):
    name = 'wikipedia'

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

        name = response.url.split("/")[-1]
        yield {
            "name": name,
            "title": response.css("h1#firstHeading::text")[0].extract()
        }

        if response.meta.get("parent") is not None:
            yield {
                "name" : name,
                "parent": response.meta["parent"],
                "weight": response.meta["weight"]
            }
        
        
        content = response.css("div#bodyContent")[0]
        
        hatnotes = content.css("div.hatnote").css("a::attr(href)").extract()

        pattern = re.compile("\/wiki/(?!(.*:.*)).*")

        meta = {"search_depth": depth, "weight": self.hatnote_weight, "parent": name}
        for hatnote in hatnotes:
            if pattern.fullmatch(hatnote):
                yield response.follow(hatnote, callback=self.parse, meta=meta)

        other_links = content.css("a::attr(href)").extract()

        meta = {"search_depth": depth, "weight": self.normal_weight, "parent": name}
        for link in other_links:
            if pattern.fullmatch(link):
                yield response.follow(link, callback=self.parse, meta=meta)
            
