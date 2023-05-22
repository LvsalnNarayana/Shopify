import { userRoutes } from "../utils/constants.js";
import { AuthController } from "../controller/AuthController.js";

const AuthRouter = (socket) => {
    const authController = new AuthController(socket);
    socket.on(userRoutes.GET_AUTH_STATUS_REQUEST, () => {
        if (socket.request.session.user != null && socket.request.session.user != undefined) {
            socket.emit(userRoutes.GET_AUTH_STATUS_RESPONSE, { status: 200, loggedin: true })
        } else {
            socket.emit(userRoutes.GET_AUTH_STATUS_RESPONSE, { status: 200, loggedin: false })
        }
    });
    socket.on(userRoutes.LOGIN_USER_REQUEST, (data) => {
        authController.LOGIN_USER(data);
    });
    socket.on(userRoutes.LOGOUT_USER_REQUEST, (user) => {
        authController.LOGOUT_USER(user);
    });
    socket.on(userRoutes.VERIFY_USER_REQUEST, (user) => {
        authController.VERIFY_USER(user);
    });
};
export default AuthRouter;