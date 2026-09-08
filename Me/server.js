import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';

// Serve only the public entry point, this feature's assets, and the modules it depends on.
const files = new Map([
  ['/', ['index.html', 'text/html; charset=utf-8']],
  ['/index.html', ['index.html', 'text/html; charset=utf-8']],
  ['/src/me.js', ['src/me.js', 'text/javascript; charset=utf-8']],
  ['/src/me.css', ['src/me.css', 'text/css; charset=utf-8']],
  ['/Journal/src/journal.js', ['../Journal/src/journal.js', 'text/javascript; charset=utf-8']],
  ['/Home/src/home.js', ['../Home/src/home.js', 'text/javascript; charset=utf-8']],
]);
const port = Number(process.env.PORT || 3003);
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
}).listen(port, '127.0.0.1', () => console.log(`Pip Me: http://localhost:${port}`));
