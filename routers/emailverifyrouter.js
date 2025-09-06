import express from "express";
import emailverify from "../controllers/emailverify.js";
const emailverifyrouter = express.Router();
emailverifyrouter.use("/emailverify",emailverify);
export default emailverifyrouter;