// fan-server/proxy.js - גרסה משופרת
const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    let targetUrl = req.query.url;
    if (!targetUrl) {
      console.error("Missing 'url' parameter");
      return res.status(400).json({ error: "Missing 'url' parameter" });
    }

    targetUrl = decodeURIComponent(targetUrl);


    if (!targetUrl.startsWith('https://')) {
      console.error("Invalid URL - must start with https://");
      return res.status(400).json({ error: "Invalid URL - must use HTTPS" });
    }

    // בדיקה שזה URL בטוח
    const allowedDomains = ['thesportsdb.com'];
    const urlObj = new URL(targetUrl);
    if (!allowedDomains.some(domain => urlObj.hostname.includes(domain))) {
      console.error(`Blocked domain: ${urlObj.hostname}`);
      return res.status(403).json({ error: "Domain not allowed" });
    }


    
    // הוספת headers כדי לדמות דפדפן רגיל
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      },
      timeout: 15000, // 15 second timeout
    });


    
    if (!response.ok) {
      const errorText = await response.text();
      
      return res.status(response.status).json({ 
        error: `API returned ${response.status}`, 
        details: errorText 
      });
    }

    const data = await response.json();

    
    // הוספת CORS headers
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    
    res.json(data);
  } catch (err) {
    console.error("❌ Proxy error:", err);
    res.status(500).json({ 
      error: "Failed to proxy request", 
      details: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
});

module.exports = router;