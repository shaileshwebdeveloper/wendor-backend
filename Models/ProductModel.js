const mongoose = require("mongoose");

// Always use new keyword

const productShema = new mongoose.Schema({
  title: { type: String, required: true },
  image: {
    type: String,
    default:
      "https://cdn.pixabay.com/photo/2017/09/10/18/25/question-2736480_1280.jpg",
  },
  price: { type: Number, required: true },
});

const ProductModel = mongoose.model("products", productShema);

module.exports = { ProductModel };

// In userSchema you can add if permitted schema types such as string,Boolean, Number
// user collection will be formed in database
