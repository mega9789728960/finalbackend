import express from "express"
import registration from "../controllers/registeration.js";

const registerrouter = express.Router();
registerrouter.use("/register",registration);

export default registerrouter;