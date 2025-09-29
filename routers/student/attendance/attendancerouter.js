import express from "express";
import attendance from "../../../controllers/student/attendance/attendance.js";
import studentauth from "../../../controllers/studentauth.js";
const attendancerouter =  express.Router();
attendancerouter.use("/attendance",studentauth,attendance);
export default attendancerouter