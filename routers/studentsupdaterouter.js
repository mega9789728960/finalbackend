import express from "express";
import authorisation from "../controllers/authorisation.js";
import studentsupdate from "../controllers/studentsupdate.js";
const studentsupdaterouter = express.Router();
studentsupdaterouter.use("/studentupdate",authorisation,studentsupdate);
export default studentsupdaterouter