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

        
        content = response.css("div#bodyContent")[0]
        
        hatnotes = content.css("div.hatnote").css("a::attr(href)").extract()

        pattern = re.compile("\/wiki/(?!(.*:.*)).*")
    
        for hatnote in hatnotes:
            if pattern.fullmatch(hatnote):
                yield {
                    "name": hatnote.split("/")[-1],
                    "parent": name,
                    "weight": self.hatnote_weight
                }
                yield response.follow(hatnote, callback=self.parse, meta={"search_depth": depth, "weight": self.normal_weight})

        other_links = content.css("a::attr(href)").extract()

        for link in other_links:
            if pattern.fullmatch(link):
                yield {
                    "name": link.split("/")[-1],
                    "parent": name,
                    "weight": self.normal_weight
                }
                yield response.follow(link, callback=self.parse, meta={"search_depth": depth, "weight": self.normal_weight})
            
