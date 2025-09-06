import loginController from "../controllers/logincontroller.js";
import express from "express";

const loginrouter = express.Router();
loginrouter.use("/login",loginController);

export default  loginrouter;