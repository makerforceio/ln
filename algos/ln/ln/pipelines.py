# -*- coding: utf-8 -*-

# Define your item pipelines here
#
# Don't forget to add your pipeline to the ITEM_PIPELINES setting
# See: https://doc.scrapy.org/en/latest/topics/item-pipeline.html

import json

import pydgraph as dg

class LnPipeline(object):

    def __init__(self):
        self.seen = {}
        client_stub = dg.DgraphClientStub("localhost:9080")
        self.client = dg.DgraphClient(client_stub)
    
    
    def process_item(self, item, spider):
        name = item["name"]
        if self.seen.get(name) is None:
            txn = self.client.txn()
            try:
                uid = self.get_node(txn, name)
                self.seen[name] = uid
                
                txn.commit()
            finally:
                txn.discard()
        uid = self.seen[name]
        
        if item.get("title") is not None:
            title = item["title"]
            txn = self.client.txn()
            try:
                txn.mutate(set_nquads="<{}> <title@en> \"{}\" .".format(uid, title))
                txn.commit()
            finally:
                txn.discard()

        if item.get("parent") is not None:
            parent = item["parent"]
            parent = self.client.query(('{find(func: eq(name, \"%s\")){uid}}') % parent)
            parent = json.loads(parent.json)['find'][0]['uid']

            weight = item["weight"]
            txn = self.client.txn()
            try:
                txn.mutate(set_nquads="<{}> <link> <{}> (weight={}) .".format(parent, uid, weight))
                txn.commit()
            finally:
                txn.discard()

        return None

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
