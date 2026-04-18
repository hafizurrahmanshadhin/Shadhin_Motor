import { createReadStream, existsSync, statSync } from 'node:fs';
import { promises as fs } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize, resolve } from 'node:path';
import { createBrotliCompress, createGzip } from 'node:zlib';

const rootDir = resolve('.');
const port = Number(process.env.PORT || 4173);

const mimeTypes = {
  '.avif': 'image/avif',
  '.css': 'text/css; charset=utf-8',
  '.gif': 'image/gif',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ttf': 'font/ttf',
  '.txt': 'text/plain; charset=utf-8',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.xml': 'application/xml; charset=utf-8'
};

const textExtensions = new Set([
  '.css',
  '.html',
  '.js',
  '.json',
  '.map',
  '.svg',
  '.txt',
  '.xml'
]);

function setSecurityHeaders(response) {
  response.setHeader(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "base-uri 'self'",
      "object-src 'none'",
      "script-src 'self'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data:",
      "media-src 'self' blob: data:",
      "connect-src 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "require-trusted-types-for 'script'"
    ].join('; ')
  );
  response.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  response.setHeader('Cross-Origin-Resource-Policy', 'same-origin');
  response.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  response.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.setHeader('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  response.setHeader('X-Content-Type-Options', 'nosniff');
  response.setHeader('X-Frame-Options', 'DENY');
}

function setCachingHeaders(response, filePath) {
  if (filePath.endsWith('.html')) {
    response.setHeader('Cache-Control', 'no-cache');
    return;
  }

  response.setHeader('Cache-Control', 'public, max-age=604800, immutable');
}

function resolveRequestPath(urlPath) {
  const requestPath = decodeURIComponent((urlPath || '/').split('?')[0]);
  const normalizedPath = normalize(requestPath).replace(/^(\.\.[/\\])+/, '');
  const directPath = normalizedPath === '/' ? '/index.html' : normalizedPath;
  const absolutePath = resolve(join(rootDir, directPath.replace(/^[/\\]+/, '')));

  if (absolutePath.startsWith(rootDir) && existsSync(absolutePath) && statSync(absolutePath).isFile()) {
    return absolutePath;
  }

  if (!extname(absolutePath)) {
    const htmlPath = resolve(`${absolutePath}.html`);
    if (htmlPath.startsWith(rootDir) && existsSync(htmlPath) && statSync(htmlPath).isFile()) {
      return htmlPath;
    }
  }

  return null;
}

function pickCompression(request, extension) {
  if (!textExtensions.has(extension)) return null;

  const acceptEncoding = String(request.headers['accept-encoding'] || '');
  if (acceptEncoding.includes('br')) return 'br';
  if (acceptEncoding.includes('gzip')) return 'gzip';
  return null;
}

const server = createServer(async (request, response) => {
  const filePath = resolveRequestPath(request.url || '/');
  if (!filePath) {
    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Not Found');
    return;
  }

  const extension = extname(filePath).toLowerCase();
  const contentType = mimeTypes[extension] || 'application/octet-stream';
  setSecurityHeaders(response);
  setCachingHeaders(response, filePath);
  response.setHeader('Content-Type', contentType);

  if (request.method === 'HEAD') {
    response.writeHead(200);
    response.end();
    return;
  }

  const compression = pickCompression(request, extension);

  try {
    if (compression) {
      response.setHeader('Vary', 'Accept-Encoding');
    }

    if (compression === 'br') {
      response.setHeader('Content-Encoding', 'br');
      createReadStream(filePath).pipe(createBrotliCompress()).pipe(response);
      return;
    }

    if (compression === 'gzip') {
      response.setHeader('Content-Encoding', 'gzip');
      createReadStream(filePath).pipe(createGzip()).pipe(response);
      return;
    }

    await fs.access(filePath);
    createReadStream(filePath).pipe(response);
  } catch {
    response.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Internal Server Error');
  }
});

server.listen(port, () => {
  console.log(`Shadhin Motor static server running at http://127.0.0.1:${port}`);
});
