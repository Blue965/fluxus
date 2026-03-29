// ============================================================
// Fluxus — Serveur Proxy Node.js
// Gère la clé HF en sécurité via .env
// Usage: node server.js   (port 3000)
// ============================================================
require('dotenv').config();
const http  = require('http');
const fs    = require('fs');
const path  = require('path');
const https = require('https');

const PORT   = process.env.PORT || 3000;
const HF_KEY = process.env.HF_TOKEN || '';

// Modèle HF — mistralai/Mistral-7B-Instruct-v0.2 (très bon pour le chat)
const HF_MODEL = process.env.HF_MODEL || 'mistralai/Mistral-7B-Instruct-v0.2';
const HF_URL   = `https://api-inference.huggingface.co/models/${HF_MODEL}`;

// ── Helper: lire le body JSON ─────────────────────────────
function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', chunk => data += chunk);
    req.on('end', () => {
      try { resolve(JSON.parse(data)); }
      catch { resolve({}); }
    });
    req.on('error', reject);
  });
}

// ── Appel HF ─────────────────────────────────────────────
function callHF(message) {
  return new Promise((resolve, reject) => {
    const prompt = `<s>[INST] Tu es Fluxus AI, l'assistant de la plateforme Fluxus pour créateurs Roblox. Réponds en français, de façon concise et sympa (max 3 phrases). Utilise des émojis. Voici la question : ${message} [/INST]`;
    const body = JSON.stringify({
      inputs: prompt,
      parameters: {
        max_new_tokens: 250,
        temperature: 0.7,
        return_full_text: false,
        do_sample: true,
      },
      options: { wait_for_model: true }
    });

    const options = {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${HF_KEY}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      }
    };

    const url = new URL(HF_URL);
    options.hostname = url.hostname;
    options.path     = url.pathname;

    const req = https.request(options, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          // Model still loading
          if (json.error && json.error.includes('loading')) {
            resolve({ error: 'loading' });
            return;
          }
          // Rate limit
          if (json.error && json.error.includes('Rate limit')) {
            resolve({ error: 'ratelimit' });
            return;
          }
          // Error
          if (json.error) {
            console.error('HF error:', json.error);
            resolve({ error: json.error });
            return;
          }
          // Success
          const text = Array.isArray(json) ? json[0]?.generated_text : json?.generated_text;
          resolve({ reply: (text || '').trim() });
        } catch(e) {
          reject(e);
        }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// ── CORS headers ─────────────────────────────────────────
function setCORS(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

// ── Serveur HTTP ──────────────────────────────────────────
const server = http.createServer(async (req, res) => {
  setCORS(res);

  // Preflight CORS
  if (req.method === 'OPTIONS') {
    res.writeHead(204); res.end(); return;
  }

  const url = req.url.split('?')[0];

  // ── API: /api/ai ──────────────────────────────────────
  if (url === '/api/ai' && req.method === 'POST') {
    try {
      const body = await readBody(req);
      const message = (body.message || '').trim();

      if (!message) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'message requis' }));
        return;
      }

      if (!HF_KEY || HF_KEY.length < 5) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'no_key', reply: 'Configure HF_TOKEN dans le fichier .env !' }));
        return;
      }

      console.log(`[AI] "${message.substring(0,60)}..."`);
      const result = await callHF(message);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(result));

    } catch(e) {
      console.error('API error:', e.message);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: e.message }));
    }
    return;
  }

  // ── Servir index.html ────────────────────────────────
  if (url === '/' || url === '/index.html') {
    const filePath = path.join(__dirname, 'index.html');
    if (fs.existsSync(filePath)) {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(fs.readFileSync(filePath));
    } else {
      res.writeHead(404); res.end('index.html introuvable');
    }
    return;
  }

  // ── 404 ──────────────────────────────────────────────
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not found' }));
});

server.listen(PORT, () => {
  console.log('╔══════════════════════════════════════════╗');
  console.log('║       Fluxus Server — Démarré !          ║');
  console.log(`║  http://localhost:${PORT}                    ║`);
  console.log(`║  Modèle HF: ${HF_MODEL.split('/').pop().substring(0,20).padEnd(20)}    ║`);
  console.log(`║  Clé HF: ${HF_KEY ? '✅ configurée' : '❌ manquante — ajoute dans .env'}   ║`);
  console.log('╚══════════════════════════════════════════╝');
});
