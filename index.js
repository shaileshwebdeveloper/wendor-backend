const express = require("express");
const cors = require("cors");
const { connection } = require("./config/db");
const { userRouter } = require("./routes/user.route");
const { productRouter } = require("./routes/product.route");
const bodyParser = require("body-parser");
const twilio = require("twilio");
const { UserModel } = require("./Models/UserModel");
const jwt = require("jsonwebtoken");
const axios = require('axios');


const swaggerJSDoc= require('swagger-jsdoc')
const swaggerUi = require('swagger-ui-express')

require("dotenv").config();

const app = express();
app.use(cors());


app.use(express.json());


const options = {
   definition :{
   openapi : "3.0.0",
   info : {
      title : 'Wendor Full Stack Project',
      version : '1.0.0'
   },
   servers : [
    { 
      url : 'http://localhost:3001/'
     }
   ]
  },
  apis : ['index.js']
}

const swaggerSpec = swaggerJSDoc(options)

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))




app.use("/", userRouter);


/**
 * @swagger
 * /products:
 *    get:
 *      summary  : Get All Products
 *      description : This api get all products
 *      responses: 
 *            200:
 *              description : To get all products
 */



/**
 * @swagger
 * /create:
 *   post:
 *     summary: Create New Product
 *     description: Create a new products using POST request
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               image:
 *                 type: string
 *               price:
 *                 type: number
 *     responses:
 *       '200':
 *         description: Resource created successfully
 *       400:
 *         description: Bad Request
 */


/**
 * @swagger
 * /products/{id}:
 *   patch:
 *     summary: Update an existing resource
 *     description: Update an existing resource using a PATCH request
 *     parameters:
 *       - in: path
 *         name: id
 *         description: ID of the resource to be updated
 *         required: true
 *         type: string
 *       - in: body
 *         name: Products
 *         description: Updated resource data
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             title:
 *                type: string
 *             image :
 *                type: string
 *             price : 
 *               type : number
 *     responses:
 *       200:
 *         description: Resource updated successfully
 *       400:
 *         description: Bad Request
 *       404:
 *         description: Resource not found
 */

/**
 * @swagger
 * /products/{id}:
 *   delete:
 *     summary: Delete a resource
 *     description: Delete a resource using a DELETE request
 *     parameters:
 *       - in: path
 *         name: id
 *         description: ID of the resource to be deleted
 *         required: true
 *         type: string
 *     responses:
 *       204:
 *         description: Resource deleted successfully
 *       404:
 *         description: Resource not found
 */


/**
 * @swagger
 * /signup:
 *   post:
 *     summary: Create New Product
 *     description: Create a new products using POST request
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type : string
 *               mobile:
 *                type : string
 *     responses:
 *       '200':
 *         description: Resource created successfully
 *       400:
 *         description: Bad Request
 */

/**
 * @swagger
 * /send-otp:
 *   post:
 *     summary: Create New Product
 *     description: Create a new products using POST request
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               mobile:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Resource created successfully
 *       400:
 *         description: Bad Request
 */



/**
 * @swagger
 * /verify-otp:
 *   post:
 *     summary: Create New Product
 *     description: Create a new products using POST request
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               mobile:
 *                 type: string
 *               otp:
 *                 type: number
 *     responses:
 *       '200':
 *         description: Resource created successfully
 *       400:
 *         description: Bad Request
 */



app.use("/", productRouter);

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN,
);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


const sendOTP =  async(phoneNumber, otp) => {
const url = 'https://www.fast2sms.com/dev/bulkV2';
const data = {
  "message": `Your Otp is ${otp}`,
  "language": "english",
  "route": "q",
  "numbers": `${phoneNumber}`
};

const config = {
  headers: {
    Authorization: process.env.API_KEY,
  },
};

return axios.post(url, data, config);

}



app.post("/send-otp", async (req, res) => {
  let { mobile } = req.body;
  mobile =  mobile;

  console.log("mobile", mobile);

  const mobileNumber = await UserModel.find({ mobile });
  //  console.log("phonenumber", mobileNumber)

  if (!mobileNumber) {
    return res.status(400).json({ message: "Phone number is required" });
  }
  else{

  try {
    const otp = Math.floor(100000 + Math.random() * 900000);
    const response = await sendOTP(mobile, otp);

    if (response.data.return) {

      await UserModel.updateOne(
        { mobile: mobile },
        { $set: { otp: otp } },
        { upsert: true },
      );

      res.status(200).json({ message: 'OTP sent successfully' });
    } else {
      res.status(400).json({ message: 'Failed to send OTP' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}

  // client.messages
  //   .create({
  //     body: `Your OTP for login is: ${otp}`,
  //     from: process.env.TWILIO_PHONE_NUMBER,
  //     to: mobile,
  //   })
  //   .then(async () => {
  //     await UserModel.updateOne(
  //       { mobile: mobile },
  //       { $set: { otp: otp } },
  //       { upsert: true },
  //     );

  //     res.json({ msg: "OTP sent successfully" });
  //   })
  //   .catch((error) => {
  //     console.error(error);
  //     res.status(500).json({ msg: "Failed to send OTP" });
  //   });
});

app.post("/verify-otp", async (req, res) => {
  const { mobile, enteredOTP } = req.body;
  console.log(req.body);

  const user = await UserModel.findOne({ mobile });

  const { name } = user;

  console.log("name", name);

  const storedOTP = user.otp;

  console.log("storedOtp", storedOTP);

  if (!storedOTP && mobile) {
    return res.status(404).send({ msg: "Please Check the mobile number" });
  } 


    if (enteredOTP === storedOTP) {
      const token = jwt.sign({ name }, process.env.SECRET_KEY);
      console.log(mobile);
      console.log("token", token);
      res.status(200).send({ msg: "Login Successfull", token: token, name: name });
    }else {
      res.status(204).send({ msg: "OTP verification failed" });
    }
  
});

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
