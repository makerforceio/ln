const express = require('express');
const fetch = require('node-fetch');
const wtf = require('wtf_wikipedia');

const app = express();

app.get('/search', async (req, res) => {
	const url = `https://en.wikipedia.org/w/api.php?action=opensearch&format=json&search=${req.query.query}`;
	const json = await (await fetch(url)).json();
	res.json(json);
});

app.get('/cards', async (req, res) => {
	const doc = await wtf.fetch(req.query.name, 'en');
	const paragraphs = [0, 1, 2].map(i => (
		{ title: 'Summary', content: doc.paragraphs(i).text() }
	));
	const link = [];
	res.json([
		...paragraphs,
		...link,
	]);
});

app.listen(8082);
