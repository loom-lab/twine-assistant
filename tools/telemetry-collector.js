#!/usr/bin/env node
/**
 * Standalone telemetry collector for HCI study.
 *
 * Usage:
 *   node tools/telemetry-collector.js [--port 3100] [--output events.jsonl]
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

// Parse CLI args
const args = process.argv.slice(2);
function flag(name, fallback) {
	const i = args.indexOf(name);
	return i !== -1 && i + 1 < args.length ? args[i + 1] : fallback;
}

const PORT = Number(flag('--port', '3100'));
const OUTPUT = path.resolve(flag('--output', 'events.jsonl'));

const CORS_HEADERS = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Methods': 'POST, OPTIONS',
	'Access-Control-Allow-Headers': 'Content-Type'
};

const server = http.createServer((req, res) => {
	// Handle CORS preflight
	if (req.method === 'OPTIONS') {
		res.writeHead(204, CORS_HEADERS);
		res.end();
		return;
	}

	if (req.method === 'POST' && req.url === '/events') {
		let body = '';
		req.on('data', (chunk) => {
			body += chunk;
		});
		req.on('end', () => {
			try {
				const event = JSON.parse(body);
				const line = JSON.stringify(event) + '\n';
				fs.appendFileSync(OUTPUT, line);
				res.writeHead(200, {...CORS_HEADERS, 'Content-Type': 'application/json'});
				res.end('{"ok":true}\n');
				console.log(`[${new Date().toISOString()}] ${event.action} (${event.outcome})`);
			} catch (err) {
				res.writeHead(400, {...CORS_HEADERS, 'Content-Type': 'application/json'});
				res.end(`{"error":"${err.message}"}\n`);
			}
		});
		return;
	}

	res.writeHead(404, CORS_HEADERS);
	res.end('{"error":"not found"}\n');
});

server.listen(PORT, () => {
	console.log(`Telemetry collector listening on http://localhost:${PORT}/events`);
	console.log(`Writing to ${OUTPUT}`);
});
