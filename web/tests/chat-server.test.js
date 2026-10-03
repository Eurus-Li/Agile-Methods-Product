import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { once } from 'node:events';

// Runs the real dev server against a fake Groq endpoint, so no key or network is needed.
async function startFakeGroq() {
  const calls = [];
  const server = createServer(async (request, response) => {
    let body = ''; for await (const chunk of request) body += chunk;
    calls.push({ auth: request.headers.authorization, body: JSON.parse(body) });
    response.writeHead(200, { 'Content-Type': 'application/json' }).end(JSON.stringify({ choices: [{ message: { content: 'Woof, I hear you ♡' } }] }));
  });
  server.listen(0, '127.0.0.1'); await once(server, 'listening');
  return { calls, url: `http://127.0.0.1:${server.address().port}/v1/chat/completions`, close: () => server.close() };
}
async function startDemo(env) {
  const port = 20000 + Math.floor(Math.random() * 20000);
  const child = spawn(process.execPath, ['scripts/serve.js'], { cwd: new URL('..', import.meta.url), env: { ...process.env, PORT: String(port), GROQ_API_KEY: '', ...env }, stdio: ['ignore', 'pipe', 'pipe'] });
  await new Promise((resolve, reject) => { child.stdout.on('data', data => String(data).includes('Rongrong demo') && resolve()); child.on('exit', reject); });
  return { base: `http://127.0.0.1:${port}`, stop: () => child.kill() };
}
const post = (base, body, headers = {}) => fetch(`${base}/api/chat`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...headers }, body: JSON.stringify(body) });
const history = [{ role: 'user', content: 'I had a long day' }];

test('chat proxy forwards to Groq with the server-side key and returns the reply', async () => {
  const groq = await startFakeGroq();
  const demo = await startDemo({ GROQ_API_KEY: 'gsk_test', GROQ_API_URL: groq.url });
  try {
    const response = await post(demo.base, { history, context: { petName: 'Mochi', address: 'dear' } });
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { reply: 'Woof, I hear you ♡' });
    assert.equal(groq.calls.length, 1);
    assert.equal(groq.calls[0].auth, 'Bearer gsk_test');
    assert.equal(groq.calls[0].body.model, 'openai/gpt-oss-20b');
    assert.match(groq.calls[0].body.messages[0].content, /You are Mochi/);
  } finally { demo.stop(); groq.close(); }
});
test('chat proxy rejects cross-origin and non-JSON requests and handles crisis locally', async () => {
  const groq = await startFakeGroq();
  const demo = await startDemo({ GROQ_API_KEY: 'gsk_test', GROQ_API_URL: groq.url });
  try {
    assert.equal((await post(demo.base, { history }, { Origin: 'https://evil.example' })).status, 403);
    assert.equal((await fetch(`${demo.base}/api/chat`, { method: 'POST', headers: { 'Content-Type': 'text/plain' }, body: JSON.stringify({ history }) })).status, 415);
    assert.equal((await post(demo.base, { history: [] })).status, 400);
    const crisis = await post(demo.base, { history: [{ role: 'user', content: 'I want to kill myself' }], context: { address: 'Fiona' } });
    assert.equal((await crisis.json()).crisis, true);
    assert.equal(groq.calls.length, 0);
  } finally { demo.stop(); groq.close(); }
});
test('chat proxy never forwards earlier crisis turns to Groq', async () => {
  const groq = await startFakeGroq();
  const demo = await startDemo({ GROQ_API_KEY: 'gsk_test', GROQ_API_URL: groq.url });
  try {
    const turns = [{ role: 'user', content: '我想死' }, { role: 'assistant', content: 'help reply' }, { role: 'user', content: 'I talked to my friend' }];
    assert.equal((await post(demo.base, { history: turns })).status, 200);
    assert.deepEqual(groq.calls[0].body.messages.slice(1), [{ role: 'user', content: 'I talked to my friend' }]);
  } finally { demo.stop(); groq.close(); }
});
test('chat proxy reports a missing key without calling Groq', async () => {
  const demo = await startDemo({ GROQ_API_URL: 'http://127.0.0.1:9/never' });
  try {
    const response = await post(demo.base, { history });
    assert.equal(response.status, 503);
    assert.deepEqual(await response.json(), { error: 'missing_key' });
  } finally { demo.stop(); }
});
