const express = require('express');
const fetch = require('node-fetch'); // ודא שזו הגרסה שאתה משתמש בה
const { URL } = require('url');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    let { url: targetUrl } = req.query;

    if (!targetUrl || typeof targetUrl !== 'string') {
      console.error("❌ Missing or invalid 'url' parameter");
      return res.status(400).json({ error: "Missing or invalid 'url' parameter" });
    }

    targetUrl = decodeURIComponent(targetUrl);

    // וולידציה של URL תקני
    let urlObj;
    try {
      urlObj = new URL(targetUrl);
    } catch (err) {
      console.error("❌ Malformed URL");
      return res.status(400).json({ error: "Malformed URL" });
    }

    if (!urlObj.protocol.startsWith('https')) {
      console.error("❌ URL must use HTTPS");
      return res.status(400).json({ error: "URL must use HTTPS" });
    }

    // דומיינים מותרים בלבד
    const allowedDomains = ['thesportsdb.com'];
    const hostnameValid = allowedDomains.some(domain => 
      urlObj.hostname === domain || urlObj.hostname.endsWith(`.${domain}`)
    );
    if (!hostnameValid) {
      console.error(`❌ Blocked domain: ${urlObj.hostname}`);
      return res.status(403).json({ error: "Domain not allowed" });
    }

    // Fetch עם timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000); // 15 שניות

    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Node.js)',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.5',
        'Connection': 'keep-alive'
      },
      signal: controller.signal
    });

    clearTimeout(timeout);

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({ 
        error: `API returned status ${response.status}`, 
        details: errorText 
      });
    }

    const data = await response.json();

    // CORS headers
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');

    return res.json(data);

  } catch (err) {
    console.error("❌ Proxy error:", err.message);
    res.status(500).json({ 
      error: "Failed to proxy request", 
      details: err.message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
  }
});

module.exports = router;
