import express from "express"
import cors from "cors";
import emailpushrouter from "./routers/emailpushrouter.js";
import emailverifyrouter from "./routers/emailverifyrouter.js";
import sendcoderouter from "./routers/sendcoderouter.js";


const api = express();
api.use(express.json());
api.use(cors());
api.use(emailpushrouter);
api.use(sendcoderouter);
api.use(emailverifyrouter);
api.listen(3000);

