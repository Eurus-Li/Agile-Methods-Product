import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';

// Serve only the public entry point and feature assets, never repository files.
const files = new Map([
  ['/', ['index.html', 'text/html; charset=utf-8']],
  ['/index.html', ['index.html', 'text/html; charset=utf-8']],
  ['/src/commercialization.js', ['src/commercialization.js', 'text/javascript; charset=utf-8']],
  ['/src/commercialization.css', ['src/commercialization.css', 'text/css; charset=utf-8']],
]);
const port = Number(process.env.PORT || 3000);
createServer(async (request, response) => {
  if (!['GET', 'HEAD'].includes(request.method)) {
    response.writeHead(405, { Allow: 'GET, HEAD' }).end();
    return;
  }
  const file = files.get(new URL(request.url, 'http://localhost').pathname);
  if (!file) { response.writeHead(404).end('Not found'); return; }
  try {
    const body = await readFile(new URL(file[0], import.meta.url));
    response.writeHead(200, { 'Content-Type': file[1], 'Cache-Control': 'no-store' });
    response.end(request.method === 'HEAD' ? undefined : body);
  } catch {
    response.writeHead(500).end('Unable to load page');
  }
}).listen(port, '127.0.0.1', () => console.log(`Rongrong Plus: http://localhost:${port}`));
