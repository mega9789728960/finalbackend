import express from "express";
import studentLoginController from "../controllers/studentLoginController.js";
const studentLoginRouter = express.Router();
studentLoginRouter.use("/studentslogin",studentLoginController)
export default studentLoginRouter
