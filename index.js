import express from "express"
import cors from "cors";
import cookieParser from "cookie-parser";
import studentsupdaterouter from "./routers/studentsupdaterouter.js";
import emailpushrouter from "./routers/emailpushrouter.js";
import emailverifyrouter from "./routers/emailverifyrouter.js";
import sendcoderouter from "./routers/sendcoderouter.js";
import registerrouter from "./routers/registerrouter.js";
import fetchstudentrouter from "./routers/fetchstudentsrouter.js";
import approverouter from "./routers/approverouter.js";
import studentLoginRouter from "./routers/studentsLoginRouter.js";
import adminLoginRouter from "./routers/adminLoginRouter.js";
const api = express();
api.use(express.json());
api.use(cors({
  origin: (origin, callback) => {
    callback(null, origin || "*"); // allow whatever origin requests
  },
  credentials: true
}));


api.use(emailpushrouter);
api.use(sendcoderouter);
api.use(emailverifyrouter);
api.use(cookieParser());
api.use(registerrouter);
api.use(fetchstudentrouter);
api.use(approverouter);
api.use(studentsupdaterouter);
api.use(studentLoginRouter);
api.use(adminLoginRouter);
// Root route to handle "/" requests
api.get("/", (req, res) => {
  res.json({ message: "API is running" });
});


api.listen(3003);