import express from "express"
import authorisation from "../controllers/authorisation.js"
import approve from "../controllers/approve.js"
const approverouter = express.Router()
approverouter.post("/approve",authorisation, approve)
export default approverouter;
