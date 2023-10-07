const { Router } = require("express");
const {
  getProducts,
  createProducts,
  deleteProducts,
  updateProducts,
} = require("../controllers/product.controller");

const productRouter = Router();

productRouter.get("/products", getProducts);
productRouter.post("/create", createProducts);
productRouter.patch("/products/:id", updateProducts);
productRouter.delete("/products/:id", deleteProducts);

module.exports = { productRouter };
