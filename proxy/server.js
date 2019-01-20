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
	const images = doc.images().map(p => (
		{ type: 'image', image: p.url() }
	)).slice(0, 1);
	const paragraphs = doc.sections(0).paragraphs().map(p => (
		{ type: 'paragraph', title: 'Summary', content: p.text() }
	)).filter(p => p.content.length > 0);
	const links = [
		{ type: 'link', title: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/' + req.query.name },
	];
	res.json([
		...images,
		...paragraphs,
		...links,
	]);
});

app.listen(8082);
