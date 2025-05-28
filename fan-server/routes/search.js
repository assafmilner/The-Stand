// fan-server/routes/search.js
const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const {
  quickSearch,
  fullSearch
} = require('../controllers/searchController');

// חיפוש מהיר לדרופדאון
// GET /api/search/quick?q=אסף
router.get('/quick', auth, quickSearch);

// חיפוש מלא לדף התוצאות
// GET /api/search/full?q=אסף&page=1&type=all&gender=זכר&location=צפון&dateFrom=2024-01-01&dateTo=2024-12-31
router.get('/full', auth, fullSearch);

module.exports = router;