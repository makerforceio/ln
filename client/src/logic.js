import { DgraphClientStub, DgraphClient } from 'dgraph-js-http';

const ENDPOINT = `${window.location.protocol}//${window.location.hostname}:8080`;

export default class Logic {

  #clientStub = new DgraphClientStub(ENDPOINT);
  #client = new DgraphClient(this.#clientStub);

  async query(query, vars) {
    const res = await this.#client.newTxn().queryWithVars(query, vars);
    console.log(res);
  }

  async graph(name) {
    return this.query(`query all($name: string) {
      var(func: eq(name, $name)) {
        root as uid
        name
        summary
      } 
      recurse(func: uid(root)) @recurse(depth: 4) {
        name
        link @facets(weight) {
          name
        }
      }
    }`, {
      $name: name,
    });
  }

}

// vim: ts=2:ss=2:sw=2:et
