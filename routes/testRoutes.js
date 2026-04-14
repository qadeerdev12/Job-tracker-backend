const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");

// Public test route
router.get("/", (req, res) => {
  res.send("API is working");
});

// Protected route
router.get("/profile", protect, (req, res) => {
  res.json({
    message: "Access granted",
    user: req.user,
  });
});

module.exports = router;
