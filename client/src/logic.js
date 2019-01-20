import { DgraphClientStub, DgraphClient } from 'dgraph-js-http';

const ENDPOINT = `${window.location.protocol}//${window.location.hostname}:8080`;

const SEARCH_URL = `https://en.wikipedia.org/w/api.php?action=opensearch&format=json&search=`

export default class Logic {

  #clientStub = new DgraphClientStub(ENDPOINT);
  #client = new DgraphClient(this.#clientStub);

  constructor() {
    this.#client.setDebugMode(process.env.NODE_ENV == 'development');
  }

  async query(query, vars) {
    const res = await this.#client.newTxn().queryWithVars(query, vars);
    if (!res.data) {
      throw new Error('response malformed');
    }
    return res.data;
  }

  async search(query) {
  }

  async graph(name) {
    return this.query(`query all($name: string) {
      var(func: eq(name, $name)) {
        root as uid
        name
        summary
      } 
      graph(func: uid(root)) @recurse(depth: 2) {
        uid
        name
        title@en
        link @facets(weight)
      }
    }`, {
      $name: name,
    });
  }

  async graphMapped(name) {
    const { graph } = await this.graph(name);
    let edges = [];
    const recurse = (a, up) => {
      if (!a) return [];
      return a.flatMap((o) => {
        if (!o.uid) return [];
        if (up) edges.push({ source: up, target: o.uid, value: '1' });
        return [
          { id: o.uid, title: o['title@en']},
          ...recurse(o.link, o.uid),
        ];
      });
    };
    const nodes = recurse(graph);
    console.log(nodes, edges);
    return { nodes: nodes, links: edges };
  }

}

// vim: ts=2:ss=2:sw=2:et
