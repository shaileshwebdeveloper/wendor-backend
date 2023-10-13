const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { UserModel } = require("../Models/UserModel");

const userSignup = async (req, res) => {

  console.log(req.body)

  const { name, email, password, mobile } = req.body; // destructure the response received

  console.log(name, email, password, mobile)

  const isUser = await UserModel.findOne({
    $or: [{ email: email }, { mobile: mobile }],
  });

  if (isUser) {
    res.send({ msg: "User already exists, try logging in" });
  } else {
    console.log("password", password);

    bcrypt.hash(password, 5, async function (err, hash) {
      // Store hash in your password DB.

      if (err) {
        res.send("Something went wrong please try again");
        console.log("err", err);
      } else {
        const new_user = new UserModel({
          name,
          email,
          password: hash,
          mobile,
        });

        try {
          await new_user.save(); // if dont want to use insertMany u can use this.
          res.send("Signup Successful");
        } catch (error) {
          res.send("Something went wrong please try again");
          console.log("error", error);
        }
      }
    });
  }
};

const userLogin = async (req, res) => {
  const { email, password } = req.body;
  const user = await UserModel.findOne({ email }); // await is important here so it will give the result
  const hashed_password = user.password;

  bcrypt.compare(password, hashed_password, function (err, result) {
    if (err) {
      res.status(400).send({ msg: "Something went wrong, try again later" });
    }

    if (result) {
      const mobile = user.mobile;

      var token = jwt.sign({ mobile }, process.env.SECRET_KEY);
      console.log("token", token);
      res
        .status(200)
        .send({ message: "Login Successfull", token: token, mobile: mobile });

      console.log(mobile);
    } else {
      res.send("Login Failed");
    }
  });
};

module.exports = {
  userSignup,
  userLogin,
};
