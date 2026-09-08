import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';

// The app shell composes every feature module, so it whitelists their public files too —
// never repository files outside this explicit list.
const files = new Map([
  ['/', ['index.html', 'text/html; charset=utf-8']],
  ['/index.html', ['index.html', 'text/html; charset=utf-8']],
  ['/src/app.js', ['src/app.js', 'text/javascript; charset=utf-8']],
  ['/src/app.css', ['src/app.css', 'text/css; charset=utf-8']],
  ['/Home/src/home.js', ['../Home/src/home.js', 'text/javascript; charset=utf-8']],
  ['/Home/src/home.css', ['../Home/src/home.css', 'text/css; charset=utf-8']],
  ['/Journal/src/journal.js', ['../Journal/src/journal.js', 'text/javascript; charset=utf-8']],
  ['/Journal/src/journal.css', ['../Journal/src/journal.css', 'text/css; charset=utf-8']],
  ['/Me/src/me.js', ['../Me/src/me.js', 'text/javascript; charset=utf-8']],
  ['/Me/src/me.css', ['../Me/src/me.css', 'text/css; charset=utf-8']],
  ['/Commercialization/src/commercialization.js', ['../Commercialization/src/commercialization.js', 'text/javascript; charset=utf-8']],
  ['/Commercialization/src/commercialization.css', ['../Commercialization/src/commercialization.css', 'text/css; charset=utf-8']],
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
}).listen(port, '127.0.0.1', () => console.log(`Pip: http://localhost:${port}`));
