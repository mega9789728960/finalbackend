import express from "express"
import cors from "cors";
import emailpushrouter from "./routers/emailpushrouter.js";
import emailverifyrouter from "./routers/emailverifyrouter.js";
import sendcoderouter from "./routers/sendcoderouter.js";
import loginrouter from "./routers/loginrouter.js";
import registerrouter from "./routers/registerrouter.js";

const api = express();
api.use(express.json());
api.use(cors());
api.use(emailpushrouter);
api.use(sendcoderouter);
api.use(emailverifyrouter);
api.use(loginrouter);
api.use(registerrouter);
export default api

