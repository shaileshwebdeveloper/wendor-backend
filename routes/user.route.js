const { Router } = require("express");
const { userSignup, userLogin } = require("../controllers/user.controller");

const userRouter = Router();

userRouter.post("/signup", userSignup);
userRouter.post("/login", userLogin);

module.exports = { userRouter };
