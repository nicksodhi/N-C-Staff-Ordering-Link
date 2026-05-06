const express = require('express');
const https   = require('https');
const path    = require('path');

const app  = express();
const PORT = process.env.PORT || 3000;
const KEY  = process.env.ANTHROPIC_API_KEY || '';

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.post('/api/parse', (req, res) => {
  if (!KEY) return res.status(500).json({ error: { message: 'ANTHROPIC_API_KEY not set on server.' } });

  const body = JSON.stringify(req.body);
  const opts = {
    hostname: 'api.anthropic.com',
    path: '/v1/messages',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': KEY,
      'anthropic-version': '2023-06-01',
      'Content-Length': Buffer.byteLength(body),
    },
  };

  const apiReq = https.request(opts, (apiRes) => {
    let data = '';
    apiRes.on('data', chunk => { data += chunk; });
    apiRes.on('end', () => res.status(apiRes.statusCode).set('Content-Type','application/json').send(data));
  });
  apiReq.on('error', err => res.status(500).json({ error: { message: err.message } }));
  apiReq.write(body);
  apiReq.end();
});

app.listen(PORT, () => console.log(`Running on port ${PORT}`));
