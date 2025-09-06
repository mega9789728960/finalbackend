import express from "express"
import approve from "../controllers/approve.js"
const   approverouter = express.Router()
approverouter.use("/approve",approve)
export default approverouter;