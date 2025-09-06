import express from "express"
import registeration from "../controllers/registeration.js";

const registerrouter = express.Router();
registerrouter.use("/register",registeration);

export default registerrouter;