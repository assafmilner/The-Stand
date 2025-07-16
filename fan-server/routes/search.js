// fan-server/routes/search.js
const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth");
const { quickSearch, fullSearch } = require("../controllers/searchController");

router.get("/quick", auth, quickSearch);

router.get("/full", auth, fullSearch);

module.exports = router;
