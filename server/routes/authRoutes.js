const rateLimit = require("express-rate-limit");

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
});

const express = require("express");

const {
  register,
  login,
} = require("../controllers/authController");

const router = express.Router();

router.post("/register", limiter, register);
router.post("/login", limiter, login);

module.exports = router;