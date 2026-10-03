import { createServer } from 'node:http';
import { existsSync, readFileSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { dirname, extname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import '../src/js/companion-chat.js';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const chat = globalThis.RongrongChat;
// Optional web/.env.local (git-ignored) so the Groq key never has to be typed into the page or committed.
const envFile = resolve(root, '.env.local');
if (existsSync(envFile)) {
  for (const line of readFileSync(envFile, 'utf8').split(/\r?\n/)) {
    const match = /^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*?)\s*$/.exec(line);
    if (match && !(match[1] in process.env)) process.env[match[1]] = match[2].replace(/^(['"])(.*)\1$/, '$2');
  }
}
const groqKey = process.env.GROQ_API_KEY || '';
const groqModel = process.env.GROQ_MODEL || chat.config.model;
const groqUrl = process.env.GROQ_API_URL || chat.config.groqUrl;
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

function sendJson(response, status, body) {
  response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }).end(JSON.stringify(body));
}

async function readJson(request) {
  let size = 0; const chunks = [];
  for await (const chunk of request) {
    size += chunk.length;
    if (size > chat.config.maxBodyBytes) throw new RangeError('Body too large');
    chunks.push(chunk);
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}

// Same-origin JSON only, so other websites open in the browser cannot spend the key.
async function handleChat(request, response) {
  const origin = request.headers.origin;
  if (origin && origin !== `http://${request.headers.host}`) return sendJson(response, 403, { error: 'forbidden' });
  if (!String(request.headers['content-type']).startsWith('application/json')) return sendJson(response, 415, { error: 'json_required' });
  let body;
  try { body = await readJson(request); } catch { return sendJson(response, 400, { error: 'bad_request' }); }
  const history = chat.sanitizeHistory(body?.history);
  const context = chat.sanitizeContext(body?.context);
  const last = history.at(-1);
  if (last?.role !== 'user') return sendJson(response, 400, { error: 'bad_request' });
  if (chat.isCrisis(last.content)) return sendJson(response, 200, { reply: chat.crisisReply(context.address), crisis: true });
  if (!groqKey) return sendJson(response, 503, { error: 'missing_key' });
  try {
    const upstream = await fetch(groqUrl, {
      method: 'POST',
      headers: { Authorization: `Bearer ${groqKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(chat.buildRequest(chat.withoutCrisisTurns(history), context, groqModel)),
      signal: AbortSignal.timeout(chat.config.timeoutMs)
    });
    if (!upstream.ok) {
      console.error(`Groq request failed: ${upstream.status} ${(await upstream.text()).slice(0, 200)}`);
      return sendJson(response, 502, { error: 'upstream', status: upstream.status });
    }
    const reply = chat.parseResponse(await upstream.json());
    return reply ? sendJson(response, 200, { reply }) : sendJson(response, 502, { error: 'empty_reply' });
  } catch (error) {
    console.error(`Groq request failed: ${error.message}`);
    return sendJson(response, 502, { error: 'upstream' });
  }
}

const server = createServer(async (request, response) => {
  if (request.method === 'POST' && new URL(request.url, 'http://localhost').pathname === chat.config.path) {
    await handleChat(request, response);
    return;
  }
  if (!['GET', 'HEAD'].includes(request.method)) {
    response.writeHead(405, { Allow: 'GET, HEAD' }).end('Method not allowed');
    return;
  }
  try {
    const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    const relativePath = pathname === '/' ? 'index.html' : pathname.slice(1);
    const file = resolve(root, relativePath);
    const isPublic = ['index.html', 'wheel.html'].includes(relativePath) || ['src', 'assets'].some(folder => file.startsWith(resolve(root, folder) + sep));
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
server.listen(port, '127.0.0.1', () => console.log(`Rongrong demo: http://127.0.0.1:${port}\n` +
  `Companion chat: ${groqKey ? `Groq ${groqModel}` : 'off (set GROQ_API_KEY in web/.env.local to enable)'}\nPress Ctrl+C to stop.`));
