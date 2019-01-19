import dgraph from 'dgraph-js-http';

const ENDPOINT = `${window.location.protocol}//${window.location.host}:8080`;

class Logic {

	#clientStub = new dgraph.DgraphClientStub(ENDPOINT);
	#dgraphClient = new dgraph.DgraphClient(clientStub);

	async query(query, vars) {
		const res = await dgraphClient.newTxn().queryWithVars(query, vars);
		console.log(res);
	}

}

