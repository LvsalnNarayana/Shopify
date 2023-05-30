import cors from 'cors';
import express, { urlencoded } from 'express';
import dotenv from 'dotenv';
import { createServer } from 'http';
import cookieParser from 'cookie-parser';
import { sessionMiddleware, store } from './utils/sessionMiddleware.js';
import connectDB from "./utils/connectDB.js";
import asyncHandler from 'express-async-handler';
import registerSocket from './utils/RegisterSocket.js';

dotenv.config();
connectDB();

var app = express();
var server = createServer(app);

// app.use(cors({
//     origin: 'http://localhost:5000',
//     credentials: true,
// }));
app.use(urlencoded({ extended: true }));
app.use(cookieParser());
app.use(sessionMiddleware);
// app.use(express.static(path.join(__dirname, 'public')));


app.get('/', asyncHandler(async (req, res, next) => {
    var cookies = req.cookies;
    if (cookies !== undefined && cookies['utk'] !== null && cookies['utk'] !== undefined) {
        store.get(req.sessionID, (err, data) => {
            if (data !== null && data !== undefined) {
                if (req.session.cookie.expires.getTime() > new Date().getTime()) {
                    res.status(200).send({ cookie: true, message: "Session Connected" });
                } else {
                    req.session.user = null;
                    req.session.save();
                    res.status(404).send({ cookie: true, message: "Session Timed Out" });
                }
            } else {
                req.session.user = null;
                req.session.save();
                res.status(404).send({ cookie: true, message: "session Not Found" });
            }
            if (err) {
                console.log(err);
            }
        });
    } else {
        req.session.user = null;
        req.session.save();
        res.status(404).send({ cookie: false, message: "session Not Found" });
    }
}));

registerSocket(server);

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection:', reason);
    // Handle the error or perform any necessary cleanup
});
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    // Handle the error or perform any necessary cleanup
});
export default server;
