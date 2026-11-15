// Servidor local para testar o Coconut P.O.S: node tools/dev-server.js 5194
const http = require('http'), fs = require('fs'), path = require('path');
const port = Number(process.argv[2] || 5194), root = path.resolve(__dirname, '..');
const types = {'.html':'text/html; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.css':'text/css; charset=utf-8', '.json':'application/json',
  '.webmanifest':'application/manifest+json', '.png':'image/png', '.svg':'image/svg+xml', '.webp':'image/webp', '.ico':'image/x-icon'};
http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]); if (p === '/') p = '/index.html';
  const f = path.join(root, path.normalize(p));
  if (!f.startsWith(root) || f.includes(path.sep + 'tools' + path.sep)) { res.writeHead(403); return res.end(); }
  fs.readFile(f, (e, d) => {
    if (e) { res.writeHead(404); return res.end('404'); }
    res.writeHead(200, {'Content-Type': types[path.extname(f)] || 'application/octet-stream', 'Cache-Control': 'no-store'});
    res.end(d);
  });
}).listen(port, '127.0.0.1', () => console.log('Coconut P.O.S em http://127.0.0.1:' + port));
