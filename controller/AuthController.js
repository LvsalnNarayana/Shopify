import User from '../models/user_model.js';
import { userRoutes } from '../utils/constants.js';
import asyncHandler from 'express-async-handler';
import match_password from '../utils/matchPassword.js';

export class AuthController {
    constructor(socket) {
        this.socket = socket;
    }
    LOGIN_USER = asyncHandler(async (user_details) => {
        let { email, password } = user_details;
        const user = await User.GET_USER_MAIL(email);
        if (user !== null && user !== undefined && await match_password(password, user.password)) {
            this.socket.request.session.user = {
                id: user?.id,
                role: user?.role
            };
            this.socket.request.session.save();
            this.socket.emit(userRoutes.LOGIN_USER_RESPONSE, { status: 200, message: 'user loggedin' });
        }
    });
    LOGOUT_USER() {
        this.socket.request.session.destroy();
        this.socket.emit(userRoutes.LOGOUT_USER_RESPONSE, { status: 200, message: 'user logged out' });
    }
    VERIFY_USER() {

    }
    LOGIN_SELLER(){}
    LOGOUT_SELLER(){}
    VERIFY_SELLER(){}
}