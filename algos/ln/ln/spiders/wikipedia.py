# -*- coding: utf-8 -*-
import scrapy


class WikipediaSpider(scrapy.Spider):
    name = 'wikipedia'
    allowed_domains = ['https://en.wikipedia.org/wiki/']
    start_urls = ['http://https://en.wikipedia.org/wiki//']

    def parse(self, response):
        pass
