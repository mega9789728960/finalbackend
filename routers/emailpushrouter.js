import express from "express";
import emailpush from "../controllers/emailpush.js";

const emailpushrouter = express.Router();
emailpushrouter.use("/emailpush",emailpush);

export default emailpushrouter