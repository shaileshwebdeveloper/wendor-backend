const { ProductModel } = require("../Models/ProductModel");

const getProducts = async (req, res) => {
  const products = await ProductModel.find();

  res.send(products);
};

const createProducts = async (req, res) => {

   console.log(req)

  try {
    const product = new ProductModel(req.body);
    await product.save();
    res.send({ msg: "Product added Successfully" });
  } catch (error) {
    console.log(error);
  }
};

const updateProducts = async (req, res) => {
  //  console.log(req.params.id)
  const payload = req.body;
  const user_data = await ProductModel.updateOne(
    { _id: req.params.id },
    { $set: payload },
  );
  res.send({ msg: "user updated succesfully" });
};

const deleteProducts = async (req, res) => {
  const user_data = await ProductModel.deleteOne({ _id: req.params.id });
  res.send({ msg: "user deleted succesfully" });
};

module.exports = {
  getProducts,
  createProducts,
  updateProducts,
  deleteProducts,
};
