import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize, sep } from 'node:path';

const root = new URL('../dist/', import.meta.url).pathname;
const port = Number(process.env.PORT ?? 4321);

const contentTypes = new Map([
  ['.css', 'text/css; charset=utf-8'],
  ['.html', 'text/html; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.md', 'text/markdown; charset=utf-8'],
  ['.png', 'image/png'],
  ['.svg', 'image/svg+xml'],
  ['.txt', 'text/plain; charset=utf-8'],
  ['.woff2', 'font/woff2'],
  ['.xml', 'application/xml; charset=utf-8'],
]);

async function fileExists(path) {
  try {
    return (await stat(path)).isFile();
  } catch {
    return false;
  }
}

async function resolvePath(pathname) {
  const decoded = decodeURIComponent(pathname);
  const normalized = normalize(decoded).replaceAll(sep, '/');
  const relative = normalized.replace(/^\/+/, '').replace(/\/+$/, '');
  const base = join(root, relative);

  if (!base.startsWith(root)) {
    throw new Error('Path escapes dist/');
  }

  if (relative === '') {
    return join(root, 'index.html');
  }

  if (decoded.endsWith('/')) {
    return join(base, 'index.html');
  }

  if (await fileExists(base)) {
    return base;
  }

  if (await fileExists(join(base, 'index.html'))) {
    return join(base, 'index.html');
  }

  return `${base}.html`;
}

const server = createServer(async (request, response) => {
  const url = new URL(request.url ?? '/', `http://127.0.0.1:${port}`);

  if (url.pathname === '/__health') {
    response.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('ok');
    return;
  }

  let filePath;
  let status = 200;

  if (/^\/404(?:\.html|\/)?$/.test(url.pathname)) {
    filePath = join(root, '404.html');
    status = 404;
  } else {
    try {
      filePath = await resolvePath(url.pathname);
    } catch {
      response.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
      response.end('Bad request');
      return;
    }

    if (!(await fileExists(filePath))) {
      filePath = join(root, '404.html');
      status = 404;
    }
  }

  try {
    const body = await readFile(filePath);
    const type = contentTypes.get(extname(filePath)) ?? 'application/octet-stream';

    response.writeHead(status, {
      'Content-Type': type,
      'Content-Length': body.byteLength,
      'Cache-Control': 'no-store',
    });
    response.end(request.method === 'HEAD' ? undefined : body);
  } catch {
    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Not found');
  }
});

server.listen(port, '127.0.0.1', () => {
  console.log(`Serving dist/ at http://127.0.0.1:${port}`);
});
