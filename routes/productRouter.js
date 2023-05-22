import { productRoutes } from "../utils/constants.js";
import { ProductsController } from "../controller/ProductController.js";

const productRouter = (socket) => {
    const productController = new ProductsController(socket);
    const userId = socket?.request?.session?.user !== null ? socket?.request?.session?.user : null;

    socket.on(productRoutes.GET_PRODUCTS_REQUEST, (data) => {
        productController.GET_PRODUCTS(userId);
    });

    socket.on(productRoutes.GET_PRODUCTS_BY_ID_REQUEST, (data) => {
        productController.GET_PRODUCT_BY_ID(userId, data.productId);
    });
}
export default productRouter;