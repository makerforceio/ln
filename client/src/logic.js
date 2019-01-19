import { DgraphClientStub, DgraphClient } from 'dgraph-js-http';

const ENDPOINT = `${window.location.protocol}//${window.location.hostname}:8080`;

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
    console.log(res.data);
  }

  async graph(name) {
    return this.query(`query all($name: string) {
      var(func: eq(name, $name)) {
        root as uid
        name
        summary
      } 
      graph(func: uid(root)) @recurse(depth: 4) {
        uid
        name
        title
        link @facets(weight) {
          uid
          name
          title
        }
      }
    }`, {
      $name: name,
    });
  }

  async graphMapped(name) {
    const { graph } = await this.graph(name);
    const recurse = (a) => {
      return a.flatMap((o) => {
        if (!o.link) {
          return [o.uid];
        }
        return recurse(o.link);
      });
    };
    return recurse(graph);
  }

}

// vim: ts=2:ss=2:sw=2:et
