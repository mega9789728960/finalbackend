import express from "express";
import adminLoginController from "../controllers/adminLoginController.js";
const adminLoginRouter = express.Router();
adminLoginRouter.use("/adminslogin",adminLoginController)
export default adminLoginRouter