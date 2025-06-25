const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// Define the controller methods

// get all function will sort by query parameter if it exists
router.get("/", productController.getAll);
router.get("/:id", productController.getById);
router.post("/", productController.create);
router.put("/:id", productController.update);
router.delete("/:id", productController.delete);

module.exports = router;