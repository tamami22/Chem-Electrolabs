/**
 * ============================================================================
 * SERVER.JS - SERVER STATIK LOKAL UNTUK MENGUJI ES MODULE & FIREBASE
 * ============================================================================
 * Menjalankan server lokal agar browser dapat memuat modul JavaScript (type="module")
 * tanpa terhalang kebijakan keamanan CORS pada protokol file://.
 * 
 * Cara menjalankan:
 * node server.js
 * Lalu buka browser di: http://localhost:3000
 * ============================================================================
 */

import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
  // Parsing URL dan tentukan path file
  let reqPath = decodeURI(req.url.split('?')[0]);
  if (reqPath === '/' || reqPath === '' || reqPath === '/index.html') {
    reqPath = '/login.html';
  }

  const safePath = path.normalize(reqPath).replace(/^(\.\.[\/\\])+/, '');
  const filePath = path.join(__dirname, safePath);

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(`<h1>404 - Halaman Tidak Ditemukan</h1><p>File ${reqPath} tidak ada.</p>`);
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Access-Control-Allow-Origin': '*'
    });

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  });
});

let currentPort = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.warn(`[Pemberitahuan] Port ${currentPort} sedang digunakan oleh aplikasi lain.`);
    currentPort++;
    console.log(`[Otomatis] Mengalihkan dan mencoba port ${currentPort}...`);
    setTimeout(() => {
      server.listen(currentPort);
    }, 200);
  } else {
    console.error('Server error:', err);
  }
});

server.listen(currentPort, () => {
  console.log(`\n==========================================================`);
  console.log(` Server lokal berjalan di: http://localhost:${currentPort}`);
  console.log(` Buka di browser: http://localhost:${currentPort}`);
  console.log(`==========================================================\n`);
});

