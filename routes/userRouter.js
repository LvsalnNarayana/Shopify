import { userRoutes } from "../utils/constants.js";
import { UserController } from "../controller/userController.js";

const userRouter = (socket) => {
    const userController = new UserController(socket);
    const userId = socket?.request?.session?.user?.id;
    socket.on(userRoutes.POST_CREATE_USER_REQUEST, (data) => {
        userController.POST_CREATE_USER(data);
    });
    socket.on(userRoutes.GET_USER_REQUEST, () => {
        if (socket.request.session.user != null && socket.request.session.user != undefined) {
            userController.GET_USER(userId);
        } else {
            socket.emit('ERROR', { code: 'USRNF', message: 'User Not Found' })
        }
    });
    socket.on(userRoutes.UPDATE_USER_REQUEST, (data) => {
        userController.UPDATE_USER(userId, data);
    });
    socket.on(userRoutes.GET_USER_ORDER_REQUEST, () => {
        userController.GET_USER_ORDER(userId);
    });
    socket.on(userRoutes.POST_CREATE_ORDER_REQUEST, (data) => {
        userController.POST_CREATE_ORDER(userId, data);
    });
    socket.on(userRoutes.GET_USER_CART_REQUEST, () => {
        userController.GET_USER_CART(userId);
    });
    socket.on(userRoutes.POST_USER_CART_REQUEST, (data) => {
        userController.POST_USER_CART(userId, data);
    });
    socket.on(userRoutes.DELETE_USER_CART_REQUEST, () => {
        userController.DELETE_USER_CART(userId);
    });
    socket.on(userRoutes.UPDATE_USER_CART_ITEM_REQUEST, (data) => {
        userController.UPDATE_USER_CART_ITEM(userId, data.data, data.operator);
    });
    socket.on(userRoutes.DELETE_USER_CART_ITEM_REQUEST, (data) => {
        userController.DELETE_USER_CART_ITEM(userId, data);
    });
    socket.on(userRoutes.GET_USER_WISHLIST_REQUEST, () => {
        userController.GET_USER_WISHLIST(userId);
    });
    socket.on(userRoutes.MOVE_TO_WISHLIST_REQUEST, (data) => {
        userController.MOVE_TO_WISHLIST(userId, data);
    });
    socket.on(userRoutes.DELETE_WHISHLIST_PRODUCT_REQUEST, (data) => {
        userController.DELETE_WHISHLIST_PRODUCT(userId, data);
    });
    socket.on(userRoutes.GET_USER_SETTINGS_REQUEST, () => {
        userController.GET_USER_SETTINGS(userId);
    });
    socket.on(userRoutes.POST_USER_SETTINGS_REQUEST, (data) => {
        userController.POST_USER_SETTINGS(userId, data);
    });
    socket.on(userRoutes.GET_USER_PAYMENTS_REQUEST, () => {
        userController.GET_USER_PAYMENTS(userId);
    });
    socket.on(userRoutes.ADD_NEW_PAYMENT_REQUEST, (data) => {
        userController.ADD_NEW_PAYMENT(userId, data);
    });
    socket.on(userRoutes.UPDATE_USER_PAYMENT_REQUEST, (data) => {
        userController.UPDATE_USER_PAYMENT(userId, data.paymentId, data.updated_payment);
    });
    socket.on(userRoutes.DELETE_USER_PAYMENT_REQUEST, (data) => {
        userController.DELETE_USER_PAYMENT(userId, data);
    });
    socket.on(userRoutes.GET_USER_ADDRESS_REQUEST, () => {
        userController.GET_USER_ADDRESS(userId);
    });
    socket.on(userRoutes.UPDATE_USER_ADDRESS_REQUEST, (data) => {
        userController.UPDATE_USER_ADDRESS(userId, data.addressId, data.new_address);
    });
    socket.on(userRoutes.ADD_NEW_ADDRESS_REQUEST, (data) => {
        userController.ADD_NEW_ADDRESS(userId, data);
    });
    socket.on(userRoutes.SET_DEFAULT_ADDRESS_REQUEST, (data) => {
        userController.SET_DEFAULT_ADDRESS(userId, data);
    });
    socket.on(userRoutes.DELETE_USER_ADDRESS_REQUEST, (data) => {
        userController.DELETE_USER_ADDRESS(userId, data);
    });
    socket.on(userRoutes.UPDATE_USER_MEMBERSHIP_REQUEST, (data) => {
        userController.UPDATE_USER_MEMBERSHIP(userId, data);
    });
}
export default userRouter;