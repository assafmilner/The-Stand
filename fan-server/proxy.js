const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    let targetUrl = req.query.url;
    if (!targetUrl) {
      return res.status(400).json({ error: "Missing 'url' parameter" });
    }

    targetUrl = decodeURIComponent(targetUrl);

    if (!targetUrl.startsWith('https://')) {
      return res.status(400).json({ error: "Invalid URL" });
    }

    const response = await fetch(targetUrl);
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error("Proxy error:", err);
    res.status(500).json({ error: "Failed to proxy request" });
  }
});

module.exports = router;
