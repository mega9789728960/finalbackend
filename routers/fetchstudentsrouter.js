import express from "express";
import fetchstudent from "../controllers/fetchstudents.js";

const fetchstudentrouter = express.Router();
fetchstudentrouter.post("/fetchstudents", fetchstudent);
export default fetchstudentrouter
