import express from "express"
import cors from "cors";
import emailpushrouter from "./routers/emailpushrouter.js";
import emailverifyrouter from "./routers/emailverifyrouter.js";
import sendcoderouter from "./routers/sendcoderouter.js";
import loginrouter from "./routers/loginrouter.js";
import registerrouter from "./routers/registerrouter.js";
import fetchstudentrouter from "./routers/fetchstudentsrouter.js";
import approverouter from "./routers/approverouter.js";

const api = express();
api.use(express.json());
api.use(cors());
api.use(emailpushrouter);
api.use(sendcoderouter);
api.use(emailverifyrouter);
api.use(loginrouter);
api.use(registerrouter);
api.use(fetchstudentrouter);
api.use(approverouter);


api.listen(3001)