//_____  require mongoose  _____//
import mongoose from "mongoose";

//________  schema  ________//
const schema = mongoose.Schema;
const product_schema = new schema({
    title: {
        type: String,
    },
    description: {
        type: String,
    },
    brand_name: {
        type: String,
    },
    category: {
        type: String,
    },
    manufacturer: {
        type: String,
    },
    condition: {
        type: String,
        enum: ["REFURBISHED", "NEW"],
    },
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "seller",
    },
    variations: [
        {
            storage: {
                type: String
            },
            price: {
                type: mongoose.Types.Decimal128
            },
            number_of_items: {
                type: Number
            },
            gift: {
                type: Boolean
            },
            offer: {
                sale_price: {
                    type: mongoose.Types.Decimal128
                },
                start_date: {
                    type: Date
                },
                end_date: {
                    type: Date
                },
                max_quantity: {
                    type: Number
                },
                offer_description: {
                    type: String
                }
            },
            premium_delivery: {
                type: Boolean
            },
            reviews: [
                {
                    userId: {
                        type: mongoose.Types.ObjectId,
                        ref: 'users'
                    },
                    rating: {
                        type: Number
                    },
                    comment: {
                        type: String
                    },
                    date: {
                        type: Date,
                    }
                }
            ],
            available: {
                type: Boolean
            },
            specifications: {
                type: mongoose.Schema.Types.Map,
                default: {}
            },
            colors: [
                {
                    name: {
                        type: String
                    },
                    color_price: {
                        type: mongoose.Types.Decimal128
                    }
                }
            ]
        }
    ]
});
product_schema.statics.GET_PRODUCTS = () => {
    const products = Products.aggregate([
        {
            $match: {},
        },
        {
            $addFields: {
                id: {
                    $toString: "$_id",
                },
            },
        },
        {
            $project: {
                _id: 0,
                __v: 0,
            },
        },
    ]);
    return products;
};
product_schema.statics.GET_PRODUCTS_BY_USER = (userId) => {
    const products = Products.aggregate([
        {
            $match: {},
        },
        {
            $addFields: {
                id: {
                    $toString: "$_id",
                },
            },
        },
        {
            $project: {
                _id: 0,
                __v: 0,
            },
        },
        {
            $lookup: {
                from: "users",
                let: { userId: mongoose.Types.ObjectId(userId) },
                pipeline: [
                    {
                        $match: {
                            $expr: { $eq: ["$_id", "$$userId"] },
                        },
                    },
                ],
                as: "users",
            },
        },
        {
            $addFields: {
                cart_id: {
                    $map: {
                        input: "$users.cart",
                        as: "carty",
                        in: "$$carty.productId",
                    },
                },
            },
        },
        {
            $unwind: "$cart_id",
        },
        {
            $addFields: {
                in_cart: {
                    $in: [
                        { $toObjectId: "$id" },
                        { $map: { input: "$cart_id", in: { $toObjectId: "$$this" } } },
                    ],
                },
            },
        },
        {
            $project: {
                cart_id: 0,
                users: 0,
            },
        },
    ]);
    return products;
};
product_schema.statics.POST_NEW_PRODUCT = () => {
    const product = null;
    return product;
};
product_schema.statics.POST_EDIT_PRODUCT = () => {
    const product = null;
    return product;
};
product_schema.statics.GET_PRODUCT_BY_ID = (productId) => {
    const products = Products.aggregate([
        {
            $match: {
                _id: mongoose.Types.ObjectId(productId),
            },
        },
        {
            $addFields: {
                id: {
                    $toString: "$_id",
                },
            },
        },
        {
            $project: {
                _id: 0,
                __v: 0,
            },
        },
    ]);
    return products;
};
product_schema.statics.GET_PRODUCT_BY_ID_USER = (userId, productId) => {
    const products = Products.aggregate([
        {
            $match: {
                _id: mongoose.Types.ObjectId(productId),
            },
        },
        {
            $addFields: {
                id: {
                    $toString: "$_id",
                },
            },
        },
        {
            $project: {
                _id: 0,
                __v: 0,
            },
        },
        {
            $lookup: {
                from: "users",
                let: { userId: mongoose.Types.ObjectId(userId) },
                pipeline: [
                    {
                        $match: {
                            $expr: { $eq: ["$_id", "$$userId"] },
                        },
                    },
                ],
                as: "users",
            },
        },
        {
            $addFields: {
                cart_id: {
                    $map: {
                        input: "$users.cart",
                        as: "carty",
                        in: "$$carty.productId",
                    },
                },
            },
        },
        {
            $unwind: "$cart_id",
        },
        {
            $addFields: {
                in_cart: {
                    $in: [
                        { $toObjectId: "$id" },
                        { $map: { input: "$cart_id", in: { $toObjectId: "$$this" } } },
                    ],
                },
            },
        },
        {
            $project: {
                cart_id: 0,
                users: 0,
            },
        },
    ]);
    return products;
};
product_schema.statics.GET_PRODUCTS_BY_BRAND = (brand) => {
    const products = null;
    return brand;
};
product_schema.statics.GET_PRODUCTS_BY_SELLER = (seller) => {
    const products = null;
    return seller;
};
const Products = mongoose.model("products", product_schema);
export default Products;
