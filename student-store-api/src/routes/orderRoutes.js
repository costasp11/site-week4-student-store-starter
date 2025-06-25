const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { order } = require('../db/db');

// Define the controller methods
router.get("/", orderController.getAll);
router.get("/:id", orderController.getById);
router.post("/", orderController.create);
router.put("/:id", orderController.update);
router.delete("/:id", orderController.delete);
router.get("/:id/total", orderController.getOrderTotal)
router.post("/:id/items", orderController.addItem)

module.exports = router;