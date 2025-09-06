import express from "express"
import sendcode from "../controllers/sendcode.js";
const sendcoderouter = express.Router();
sendcoderouter.use("/sendcode",sendcode);
export default sendcoderouter;