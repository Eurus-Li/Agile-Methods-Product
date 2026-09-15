import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { dirname, extname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const port = Number(process.env.PORT || 8000);
const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
};

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  console.error('PORT must be an integer between 1 and 65535.');
  process.exit(1);
}

const server = createServer(async (request, response) => {
  if (!['GET', 'HEAD'].includes(request.method)) {
    response.writeHead(405, { Allow: 'GET, HEAD' }).end('Method not allowed');
    return;
  }
  try {
    const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    const relativePath = pathname === '/' ? 'index.html' : pathname.slice(1);
    const file = resolve(root, relativePath);
    const isPublic = relativePath === 'index.html' || ['src', 'assets'].some(folder => file.startsWith(resolve(root, folder) + sep));
    if (!file.startsWith(root + sep) || !isPublic || !mimeTypes[extname(file)]) {
      response.writeHead(404).end('Not found');
      return;
    }
    const content = await readFile(file);
    response.writeHead(200, {
      'Content-Type': mimeTypes[extname(file)],
      'Content-Length': content.length,
      'Cache-Control': 'no-store',
    });
    response.end(request.method === 'HEAD' ? undefined : content);
  } catch (error) {
    response.writeHead(error instanceof URIError ? 400 : 404).end(error instanceof URIError ? 'Bad request' : 'Not found');
  }
});

server.on('error', error => {
  console.error(error.code === 'EADDRINUSE'
    ? `Port ${port} is in use. Stop the existing server or run PORT=8001 npm run dev.`
    : error.message);
  process.exit(1);
});
server.listen(port, '127.0.0.1', () => console.log(`Pip demo: http://127.0.0.1:${port}\nPress Ctrl+C to stop.`));
