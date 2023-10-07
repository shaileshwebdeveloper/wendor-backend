const express = require("express");
const cors = require("cors");
const { connection } = require("./config/db");
const { userRouter } = require("./routes/user.route");
const { productRouter } = require("./routes/product.route");
const bodyParser = require("body-parser");
const twilio = require("twilio");
const { UserModel } = require("./Models/UserModel");
const jwt = require("jsonwebtoken");

require("dotenv").config();

const app = express();
app.use(cors());

app.use(express.json());

app.use("/", userRouter);
app.use("/", productRouter);

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN,
);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());



app.post("/send-otp", async (req, res) => {

 let  { mobile } = req.body;
 mobile =  "+91" + mobile

  console.log("mobile", mobile)

  const mobileNumber = await UserModel.find({ mobile });
  //  console.log("phonenumber", mobileNumber)

  if (!mobileNumber) {
    return res.status(400).json({ message: "Phone number is required" });
  }

  const otp = Math.floor(100000 + Math.random() * 900000);

  client.messages
    .create({
      body: `Your OTP for login is: ${otp}`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: mobile,
    })
    .then(async () => {

      await UserModel.updateOne(
        { mobile: mobile },
        { $set: { otp: otp } },
        { upsert: true },
      );

      res.json({ msg: "OTP sent successfully" });
    })
    .catch((error) => {
      console.error(error);
      res.status(500).json({ msg: "Failed to send OTP" });
    });
});



app.post("/verify-otp", async (req, res) => {

  const { mobile, enteredOTP } = req.body;
  console.log(req.body)

  const user = await UserModel.findOne({ mobile });

  const {name} = user

  console.log("name" , name)

  const storedOTP = user.otp

  console.log('storedOtp', storedOTP)


  if (!storedOTP) {
    return res.send({ msg: "OTP not found" });
  }
  else {

  if (enteredOTP === storedOTP) {

    var token = jwt.sign({ name }, process.env.SECRET_KEY);
    console.log("token", token);
   res.status(200).send({ msg: "Login Successfull", token: token, name: name });

    console.log(mobile);

    // res.json({ message: 'OTP verified successfully' });
  } else {

    res.status(204).send({ msg: "OTP verification failed" });
  }
}
})

app.listen(process.env.PORT, async () => {
  try {
    await connection;
    console.log("Connection to DB successfully");
  } catch (error) {
    console.log("Error connecting to DB");
    console.log(error);
  }

  console.log("Listening Port 3001");
});
