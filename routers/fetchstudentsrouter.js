import express from "express";
import fetchstudent from "../controllers/fetchstudents.js";

const fetchstudentrouter = express.Router();
fetchstudentrouter.use("/fetchstudents",fetchstudent);
export default fetchstudentrouter