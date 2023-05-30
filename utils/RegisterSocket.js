import { Server } from 'socket.io';
import { sessionMiddleware } from './sessionMiddleware.js';
import userRouter from '../routes/userRouter.js';
import AuthRouter from '../routes/AuthRouter.js';
import productRouter from '../routes/productRouter.js';

const connected_users = new Map();

const registerSocket = (server) => {
    const io = new Server(server, {
        path:'/socket.io',
        cors: {
            methods: ['GET', 'POST', 'UPDATE', 'DELETE']
        },
        credentials: true
    });
    io.use((socket, next) => {
        sessionMiddleware(socket.request, {}, next);
    });
    io.on('connection', (socket) => {
        AuthRouter(socket);
        productRouter(socket);
        if (socket.request.session.user !== null) {
            userRouter(socket);
        }
    });

    // io.of('admin').use((socket, next) => {
    //     console.log(connected_users);
    //     next();
    // })
    // io.of('admin').on('connection', (socket) => {
    //     console.log("admin : " + socket.id);
    // })
};
export default registerSocket;
