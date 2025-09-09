import express from "express"
import approve from "../controllers/approve.js"
const approverouter = express.Router()
approverouter.post("/approve", approve)
export default approverouter;
