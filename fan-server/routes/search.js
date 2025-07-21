// ### Express Router: Search Routes
// Provides authenticated endpoints for quick and full-text search capabilities
// across posts, users, and other entities in the system.

const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth");
const { quickSearch, fullSearch } = require("../controllers/searchController");

router.get("/quick", auth, quickSearch);
router.get("/full", auth, fullSearch);

module.exports = router;
