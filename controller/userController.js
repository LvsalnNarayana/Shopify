import User from "../models/user_model.js";
import { userRoutes } from "../utils/constants.js";
import asyncHandler from "express-async-handler";
import Products from "../models/product_model.js";

export class UserController {
    constructor(socket) {
        this.socket = socket;
    }
    POST_CREATE_USER = asyncHandler(async (user_data) => {
        const user = await User.CREATE_USER(user_data);
        if (user != null) {
            this.socket.emit(userRoutes.POST_CREATE_USER_RESPONSE, user);
        }
    });
    GET_USER = asyncHandler(async (userId) => {
        const user = await User.GET_USER(userId);
        if (user != null) {
            this.socket.emit(userRoutes.GET_USER_RESPONSE, user);
        } else {
            this.socket.request.session.destroy();
            this.socket.emit(userRoutes.GET_AUTH_STATUS_RESPONSE, { status: 200, loggedin: false });
        };
    });
    UPDATE_USER = asyncHandler(async (userId, new_data) => {
        const update_user = await User.UPDATE_USER(userId, new_data);
        if (update_user !== null) {
            const user = await User.GET_USER(userId);
            if (user != null) {
                this.socket.emit(userRoutes.UPDATE_USER_RESPONSE, user);
            } else {
                this.socket.request.session.destroy();
                this.socket.emit(userRoutes.GET_AUTH_STATUS_RESPONSE, { status: 200, loggedin: false })
            };
        }
    });
    GET_USER_ORDER = asyncHandler(async (userId) => {
        const orders = await User.GET_USER_ORDER(userId);
        this.socket.emit(userRoutes.GET_USER_ORDER_RESPONSE, orders);
    });
    POST_CREATE_ORDER = asyncHandler(async (userId, cart_data) => {
        const order = await User.POST_CREATE_ORDER(userId, cart_data);
        const orders = await User.GET_USER_ORDER(userId);
        const cart = await User.GET_USER_CART(userId);
        const response = cart?.products?.length > 0 ? cart : { products: [], total: { $numberDecimal: "0.00" } };
        if (order.matchedCount === 1) {
            this.socket.emit(userRoutes.GET_USER_CART_RESPONSE, response);
            this.socket.emit(userRoutes.POST_CREATE_ORDER_RESPONSE, orders);
        } else {
            this.socket.emit(userRoutes.GET_USER_CART_RESPONSE, response);
            this.socket.emit(userRoutes.POST_CREATE_ORDER_RESPONSE, orders);
        }
    });
    GET_USER_CART = asyncHandler(async (userId) => {
        const cart = await User.GET_USER_CART(userId);
        const response = cart?.products?.length > 0 ? cart : { products: [], total: { $numberDecimal: "0.00" } };
        this.socket.emit(userRoutes.GET_USER_CART_RESPONSE, response);
    });
    POST_USER_CART = asyncHandler(async (userId, data) => {
        const update_cart = await User.POST_USER_CART(userId, data);
        const product = await Products.GET_PRODUCT_BY_ID_USER(userId, data.productId);
        if (update_cart.modifiedCount === 1 && product.length > 0) {
            const cart = await User.GET_USER_CART(userId);
            const response = cart?.products?.length > 0 ? cart : { products: [], total: { $numberDecimal: "0.00" } };
            this.socket.emit(userRoutes.POST_USER_CART_RESPONSE, { cart: response, product: product[0] });
        }
    });
    DELETE_USER_CART = asyncHandler(async (userId) => {
        const delete_cart = await User.DELETE_USER_CART(userId);
        if (delete_cart.modifiedCount === 1) {
            const cart = await User.GET_USER_CART(userId);
            const response = cart?.products?.length > 0 ? cart : { products: [], total: { $numberDecimal: "0.00" } };
            this.socket.emit(userRoutes.DELETE_USER_CART_RESPONSE, response);
        }
    });
    UPDATE_USER_CART_ITEM = asyncHandler(async (userId, data, operator) => {
        const cart_item = await User.GET_USER_CART_ITEM(userId, data);
        if (cart_item[0]?.cart?.quantity >= 1 && operator === 'INCREMENT') {
            const update_cart_item = await User.UPDATE_USER_CART_ITEM(userId, data, operator);
            if (update_cart_item.modifiedCount === 1) {
                const cart = await User.GET_USER_CART(userId);
                const response = cart?.products?.length > 0 ? cart : { products: [], total: { $numberDecimal: "0.00" } };
                this.socket.emit(userRoutes.UPDATE_USER_CART_ITEM_RESPONSE, response);
            }
        } else if (cart_item[0]?.cart?.quantity > 1 && operator === 'DECREMENT') {
            const update_cart_item = await User.UPDATE_USER_CART_ITEM(userId, data, operator);
            if (update_cart_item.modifiedCount === 1) {
                const cart = await User.GET_USER_CART(userId);
                const response = cart?.products?.length > 0 ? cart : { products: [], total: { $numberDecimal: "0.00" } };
                this.socket.emit(userRoutes.UPDATE_USER_CART_ITEM_RESPONSE, response);
            }
        } else {
            const delete_cart_item = await User.DELETE_USER_CART_ITEM(userId, data);
            if (delete_cart_item.modifiedCount === 1) {
                const cart = await User.GET_USER_CART(userId);
                const response = cart?.products?.length > 0 ? cart : { products: [], total: { $numberDecimal: "0.00" } };
                this.socket.emit(userRoutes.UPDATE_USER_CART_ITEM_RESPONSE, response);
            }
        }
    });
    DELETE_USER_CART_ITEM = asyncHandler(async (userId, productId) => {
        const delete_cart_item = await User.DELETE_USER_CART_ITEM(userId, productId);
        if (delete_cart_item.modifiedCount === 1) {
            const cart = await User.GET_USER_CART(userId);
            const response = cart?.products?.length > 0 ? cart : { products: [], total: { $numberDecimal: "0.00" } };
            this.socket.emit(userRoutes.DELETE_USER_CART_ITEM_RESPONSE, response);
        }
    });
    GET_USER_WISHLIST = asyncHandler(async (userId) => {
        const wishlist = await User.GET_USER_WISHLIST(userId);
        this.socket.emit(userRoutes.GET_USER_WISHLIST_RESPONSE, wishlist[0].wishlist);
    });
    DELETE_WHISHLIST_PRODUCT = asyncHandler(async (userId, productId) => {
        const delete_wishlist_item = await User.DELETE_WHISHLIST_PRODUCT(
            userId,
            productId
        );
        if (delete_wishlist_item.modifiedCount === 1) {
            const wishlist = await User.GET_USER_WISHLIST(userId);
            this.socket.emit(userRoutes.DELETE_WHISHLIST_PRODUCT_RESPONSE, wishlist[0].wishlist);
        }
    });
    MOVE_TO_WISHLIST = asyncHandler(async (userId, productId) => {
        const update_wishlist_item = await User.MOVE_TO_WISHLIST(userId, productId);
        if (update_wishlist_item.modifiedCount === 1) {
            const cart = await User.GET_USER_CART(userId);
            const wishlist = await User.GET_USER_WISHLIST(userId);
            this.socket.emit(userRoutes.MOVE_TO_WISHLIST_RESPONSE, {
                cart: cart[0].cart,
                wishlist: wishlist[0].wishlist,
            });
        }
    });
    GET_USER_SETTINGS = asyncHandler(async (userId) => {
        const settings = await User.GET_USER_SETTINGS(userId);
        this.socket.emit(userRoutes.GET_USER_SETTINGS_RESPONSE, settings[0].settings);
    });
    POST_USER_SETTINGS = asyncHandler(async (userId, new_settings) => {
        const update_settings = await User.POST_USER_SETTINGS(userId, new_settings);
        if (update_settings.modifiedCount === 1) {
            const settings = await User.GET_USER_SETTINGS(userId);
            this.socket.emit(userRoutes.POST_USER_SETTINGS_RESPONSE, settings[0]?.settings);
        }
    });
    GET_USER_PAYMENTS = asyncHandler(async (userId) => {
        const payments = await User.GET_USER_PAYMENTS(userId);
        this.socket.emit(userRoutes.GET_USER_PAYMENTS_RESPONSE, payments);
    });
    ADD_NEW_PAYMENT = asyncHandler(async (userId, data) => {
        const add_new_payment = await User.ADD_NEW_PAYMENT(userId, data);
        if (add_new_payment.modifiedCount === 1) {
            const payments = await User.GET_USER_PAYMENTS(userId);
            this.socket.emit(userRoutes.ADD_NEW_PAYMENT_RESPONSE, payments);
        }
    });
    UPDATE_USER_PAYMENT = asyncHandler(async (userId, paymentId, updated_payment) => {
        const update_payments = await User.UPDATE_USER_PAYMENT(
            userId,
            paymentId,
            updated_payment
        );
        if (update_payments.modifiedCount === 1) {
            const payments = await User.GET_USER_PAYMENTS(userId);
            this.socket.emit(userRoutes.UPDATE_USER_PAYMENT_RESPONSE, payments);
        }
    });
    DELETE_USER_PAYMENT = asyncHandler(async (userId, paymentId) => {
        const delete_payment = await User.DELETE_USER_PAYMENT(userId, paymentId);
        if (delete_payment.modifiedCount === 1) {
            const payments = await User.GET_USER_PAYMENTS(userId);
            this.socket.emit(userRoutes.DELETE_USER_PAYMENT_RESPONSE, payments);
        }
    });
    GET_USER_ADDRESS = asyncHandler(async (userId) => {
        const address = await User.GET_USER_ADDRESS(userId);
        this.socket.emit(userRoutes.GET_USER_ADDRESS_RESPONSE, address);
    });
    ADD_NEW_ADDRESS = asyncHandler(async (userId, data) => {
        const add_new_address = await User.ADD_NEW_ADDRESS(userId, data);
        if (add_new_address.modifiedCount === 1) {
            const address = await User.GET_USER_ADDRESS(userId);
            this.socket.emit(userRoutes.ADD_NEW_ADDRESS_RESPONSE, address);
        }
    });
    UPDATE_USER_ADDRESS = asyncHandler(async (userId, addressId, new_address) => {
        const update_address = await User.UPDATE_USER_ADDRESS(
            userId,
            addressId,
            new_address
        );
        if (update_address.modifiedCount === 1) {
            const address = await User.GET_USER_ADDRESS(userId);
            this.socket.emit(userRoutes.UPDATE_USER_ADDRESS_RESPONSE, address);
        }
    });
    SET_DEFAULT_ADDRESS = asyncHandler(async (userId, addressId) => {
        const update_address = await User.SET_DEFAULT_ADDRESS(userId, addressId);
        if (update_address.modifiedCount === 1) {
            const address = await User.GET_USER_ADDRESS(userId, addressId);
            this.socket.emit(userRoutes.SET_DEFAULT_ADDRESS_RESPONSE, address);
        }
    });
    DELETE_USER_ADDRESS = asyncHandler(async (userId, addressId) => {
        const delete_address = await User.DELETE_USER_ADDRESS(userId, addressId);
        if (delete_address.result.nModified >= 1) {
            const address = await User.GET_USER_ADDRESS(userId);
            this.socket.emit(userRoutes.DELETE_USER_ADDRESS_RESPONSE, address);
        }
    });
    UPDATE_USER_MEMBERSHIP = asyncHandler(async () => {
        this.socket.emit(userRoutes.UPDATE_USER_MEMBERSHIP_RESPONSE, {});
    });
}
