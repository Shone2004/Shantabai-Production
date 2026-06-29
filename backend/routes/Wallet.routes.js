const express = require("express");
const router = express.Router();
const { getMyWallet, requestWithdrawal } = require("../controllers/Wallet.controller");
const { authenticateUser } = require("../middleware/authMiddleware");
const { allowRoles } = require("../middleware/roleMiddleware");

// All wallet routes require Provider auth
router.use(authenticateUser, allowRoles("PROVIDER"));

// @route   GET /api/wallet/me
router.get("/me", getMyWallet);

// @route   POST /api/wallet/withdraw
router.post("/withdraw", requestWithdrawal);

module.exports = router;