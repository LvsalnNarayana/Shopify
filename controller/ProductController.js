import Products from "../models/product_model.js";
import asyncHandler from 'express-async-handler';
import { productRoutes } from "../utils/constants.js";

export class ProductsController {
    constructor(socket) {
        this.socket = socket;
    }
    GET_PRODUCTS = asyncHandler(async (userId) => {
        let result;
        if (userId !== null) {
            result = await Products.GET_PRODUCTS_BY_USER(userId);
        } else {
            result = await Products.GET_PRODUCTS();
        }
        this.socket.emit(productRoutes.GET_PRODUCTS_RESPONSE, result);
    });
    GET_PRODUCT_BY_ID = asyncHandler(async (userId, productId) => {
        let result;
        if (userId !== null) {
            result = await Products.GET_PRODUCT_BY_ID_USER(userId, productId);
        } else {
            result = await Products.GET_PRODUCT_BY_ID(productId);
        }
        this.socket.emit(productRoutes.GET_PRODUCTS_BY_ID_RESPONSE, result[0]);
    })
}