import express from "express";
import fetchNotificationForStudents from "../../../controllers/student/notification/fetchnotificationsforstudents.js";
import studentauth from "../../../controllers/studentauth.js";
const fetchNotificationForStudentsrouter = express.Router();
fetchNotificationForStudentsrouter.use("/fetchnotificationforstudents",studentauth,fetchNotificationForStudents);
export default fetchNotificationForStudentsrouter;