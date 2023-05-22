//_____  require mongoose  _____//
import mongoose from "mongoose";
import bcryptjs from "bcryptjs";
import crypto from 'crypto';

//________  schema  ________//
const schema = mongoose.Schema;

const user_schema = new schema(
    {
        role: {
            type: String,
            default: "USER",
            enums: ["USER", "SELLER", "ADMIN"],
        },
        username: {
            type: String,
            lowercase: true,
            trim: true,
            get: (data) => capitalize(data),
        },
        email: {
            type: String,
            lowercase: true,
            unique: true,
            trim: true,
            max: 30,
        },
        countryCode: {
            type: String,
        },
        mobile: {
            type: String,
            unique: true,
            trim: true,
            validate: {
                validator: (data) => {
                    return data.toString().length === 10;
                },
            },
        },
        password: {
            type: String,
            trim: true,
        },
        dob: {
            type: Date,
        },
        subscription: {
            type: String,
            default: "DEFAULT",
            enums: ["DEFAULT", "PREMIUM"],
        },
        address: [
            {
                line1: {
                    type: String,
                },
                line2: {
                    type: String,
                },
                line3: {
                    type: String,
                },
                city: {
                    type: String,
                },
                country: {
                    type: String,
                },
                postcode: {
                    type: String,
                },
                phone: {
                    type: String,
                },
                name: {
                    type: String,
                },
                is_default: {
                    type: Boolean,
                    default: false
                },
                billing_address: {
                    type: Boolean,
                    default: false
                },
            },
        ],
        orders: [
            {
                products: [
                    {
                        productId: {
                            type: mongoose.Schema.Types.ObjectId,
                            ref: 'products'
                        },
                        variationId: {
                            type: mongoose.Schema.Types.ObjectId,
                            ref: 'products.variations'
                        },
                        colorId: {
                            type: String,
                        },
                        quantity: {
                            type: Number
                        }
                    }
                ],
                total: {
                    type: mongoose.Types.Decimal128,
                    default: 0
                },
                address: {
                    line1: {
                        type: String,
                    },
                    line2: {
                        type: String,
                    },
                    line3: {
                        type: String,
                    },
                    city: {
                        type: String,
                    },
                    country: {
                        type: String,
                    },
                    postcode: {
                        type: String,
                    },
                    phone: {
                        type: String,
                    },
                    name: {
                        type: String,
                    },
                    is_default: {
                        type: Boolean,
                    },
                    billing_address: {
                        type: Boolean,
                    },
                },
                payment: {
                    encrypted_data: {
                        type: String,
                    },
                    type: {
                        type: String,
                    },
                    date_added: {
                        type: Date,
                        default: new Date()
                    }
                },
                order_status: {
                    type: String,
                    enums: ['RECEIVED', 'PENDING', 'DISPATCHED', 'LOST IN TRANSIT', 'DELIVERED']
                },
                delivery_date: {
                    type: Date,
                },
                order_placed: {
                    type: Date
                }
            },
        ],
        cart: [
            {
                _id: false,
                productId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "products",
                },
                variationId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "products.variations",
                },
                colorId: {
                    type: String,
                },
                quantity: {
                    type: Number,
                    default: 1,
                },
            }
        ],
        wishlist: [
            {
                _id: false,
                type: mongoose.Schema.Types.ObjectId,
                ref: "products",
            },
        ],
        settings: {
            type: mongoose.Schema.Types.Map,
            default: {}
        },
        seller: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "seller",
        },
        payments: [{
            default_payment: {
                type: Boolean,
                default: false
            },
            encrypted_data: {
                type: String,
            },
            type: {
                type: String,
            },
            date_added: {
                type: Date,
                default: new Date()
            }
        }],
    },
    {
        timestamps: true,
    }
);

//=========================================================================

const secretKey = Buffer.alloc(32);
secretKey.write("wowthisisasecretkey".padEnd(32, "\0"), "utf8");
const iv = Buffer.alloc(16);
iv.write("wowthisisasecretkey".padEnd(32, "\0"), "utf8");

const encrypt = (text) => {
    const cipher = crypto.createCipheriv('aes-256-cbc', secretKey, iv);
    let encrypted = cipher.update(text, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    return encrypted;
};

const decrypt = (data) => {
    const decipher = crypto.createDecipheriv('aes-256-cbc', secretKey, Buffer.from(iv, 'base64'));
    let decrypted = decipher.update(data, 'base64', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
};


user_schema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        next();
    }
    const salt = await bcryptjs.genSalt(10);
    this.password = await bcryptjs.hash(this.password, salt);
});

user_schema.statics.GET_USER_MAIL = (email_id) => {
    const user = User.aggregate([
        {
            $match: {
                email: email_id,
            }
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
                email: 1,
                password: 1,
                id: 1,
                role: 1
            }
        },
        {
            $project: {
                _id: 0
            }
        }
    ]).then((data) => {
        return data[0]
    });
    return user
}
user_schema.statics.CREATE_USER = (user_data) => {
    const user = new User({
        username: user_data.username,
        email: user_data.email,
        countryCode: user_data.countryCode,
        mobile: user_data.mobile,
        password: user_data.password,
        dob: user_data.dob
    });
    user.save()
}
user_schema.statics.GET_USER = (userId) => {
    const user = User.aggregate([
        {
            $match: {
                _id: mongoose.Types.ObjectId(userId),
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
                password: 0,
                _id: 0,
                __v: 0,
                cart: 0,
                wishlist: 0,
                orders: 0,
                address: 0,
                payments: 0,
                seller: 0,
            },
        },
    ]).then((data) => {
        return data[0]
    });
    return user;
};
user_schema.statics.UPDATE_USER = (userId, new_data) => {
    const user = User.findOneAndUpdate(userId, new_data, { new: true });
    return user;
};
user_schema.statics.GET_USER_ORDER = (userId) => {
    const orders = User.aggregate([
        {
            $match: {
                _id: mongoose.Types.ObjectId(userId)
            }
        },
        {
            $lookup: {
                from: "products",
                localField: "orders.products.productId",
                foreignField: "_id",
                as: "product",
            }
        },
        {
            $addFields: {
                "orders": {
                    $map: {
                        input: "$orders",
                        as: "order",
                        in: {
                            $mergeObjects: [
                                "$$order",
                                {
                                    products: {
                                        $map: {
                                            input: "$$order.products",
                                            as: "product_order",
                                            in: {
                                                $mergeObjects: [
                                                    "$$product_order",
                                                    {
                                                        $arrayElemAt: [
                                                            {
                                                                $filter: {
                                                                    input: "$product",
                                                                    as: "product_details",
                                                                    cond: {
                                                                        $and: [
                                                                            { $eq: ["$$product_details._id", "$$product_order.productId"] },
                                                                        ]
                                                                    }
                                                                }
                                                            },
                                                            0
                                                        ]
                                                    }
                                                ]
                                            }
                                        }
                                    }
                                }
                            ]
                        }
                    }
                }
            }
        },
        {
            $addFields: {
                "orders": {
                    $map: {
                        input: "$orders",
                        as: "order",
                        in: {
                            $mergeObjects: [
                                "$$order",
                                {
                                    products: {
                                        $map: {
                                            input: "$$order.products",
                                            as: "product",
                                            in: {
                                                $mergeObjects: [
                                                    "$$product",
                                                    {
                                                        variations: {
                                                            $filter: {
                                                                input: "$$product.variations",
                                                                as: "variation",
                                                                cond: {
                                                                    $eq: ["$$variation._id", "$$product.variationId"]
                                                                }
                                                            }
                                                        }
                                                    }
                                                ]
                                            }
                                        }
                                    }
                                }
                            ]
                        }
                    }
                }
            }
        },
        {
            $addFields: {
                "orders": {
                    $map: {
                        input: "$orders",
                        as: "order",
                        in: {
                            $mergeObjects: [
                                "$$order",
                                {
                                    products: {
                                        $map: {
                                            input: "$$order.products",
                                            as: "product",
                                            in: {
                                                $mergeObjects: [
                                                    "$$product",
                                                    {
                                                        variations: {
                                                            $arrayElemAt: [
                                                                {
                                                                    $map: {
                                                                        input: "$$product.variations",
                                                                        as: "variation",
                                                                        in: {
                                                                            $mergeObjects: [
                                                                                "$$variation",
                                                                                {
                                                                                    colors: {
                                                                                        $arrayElemAt: [
                                                                                            {
                                                                                                $filter: {
                                                                                                    input: "$$variation.colors",
                                                                                                    as: "color",
                                                                                                    cond: {
                                                                                                        $eq: ["$$color.name", "$$product.colorId"]
                                                                                                    }
                                                                                                }
                                                                                            }
                                                                                            , 0
                                                                                        ]
                                                                                    }
                                                                                }

                                                                            ]
                                                                        }
                                                                    },
                                                                },
                                                                0
                                                            ]
                                                        }
                                                    }
                                                ]
                                            }
                                        }
                                    }
                                }
                            ]
                        }
                    }
                }
            }
        },
        {
            $project: {
                "orders.products.productId": 0,
                "orders.products.variationId": 0,
                "orders.products.colorId": 0
            }
        },
        {
            $project: {
                orders: 1,
            }
        },
        {
            $project: {
                _id: 0,
                __v: 0
            },
        },
    ]).then((data) => {
        return data[0].orders;
    });
    return orders;
};
user_schema.statics.POST_CREATE_ORDER = async (userId, order_data) => {
    const payment = await User.GET_USER_PAYMENT_BY_ID(userId, order_data?.paymentId);
    const address = await User.GET_USER_ADDRESS_BY_ID(userId, order_data?.addressId);
    const currentDate = new Date(); // Current date and time
    const futureDate = new Date(currentDate);
    const card_data = JSON.stringify({
        payee_name: payment.payee_name,
        card_number: payment.card_number,
        card_expiry: payment.card_expiry,
    });
    const encrypted_data = encrypt(card_data);
    const order_details = {
        products: order_data.products,
        total: order_data.total,
        address: {
            line1: address.line1,
            line2: address.line2,
            line3: address.line3,
            city: address.city,
            country: address.country,
            postcode: address.postcode,
            phone: address.phone,
            name: address.name
        },
        payment: {
            encrypted_data: encrypted_data,
            type: payment.type,
            date_added: payment.date_added
        },
        order_status: 'RECEIVED',
        delivery_date: futureDate.setDate(futureDate.getDate() + 5),
        order_placed: currentDate

    };
    const order = User.updateOne(
        {
            _id: userId,
        },
        {
            $addToSet: {
                "orders": { ...order_details },
            },
        },
        {
            upsert: true,
        }
    );
    const cart = await User.DELETE_USER_CART(userId);
    if (cart.modifiedCount === 1) {
        return order;
    }
}
user_schema.statics.GET_USER_CART = (userId) => {
    const cart = User.aggregate([
        {
            $match: {
                _id: mongoose.Types.ObjectId(userId)
            }
        },
        {
            $unwind: "$cart"
        },
        {
            $lookup: {
                from: "products",
                let: { productId: "$cart.productId", variationId: "$cart.variationId", colorId: "$cart.colorId" },
                localField: "cart.productId",
                foreignField: "_id",
                as: "product",
                pipeline: [
                    {
                        $addFields: {
                            variations: {
                                $filter: {
                                    input: "$variations",
                                    as: "variation",
                                    cond: {
                                        $eq: ["$$variation._id", "$$variationId"]
                                    }
                                }
                            }
                        }
                    },
                    {
                        $addFields: {
                            "variations": {
                                $map: {
                                    input: "$variations",
                                    as: "variation",
                                    in: {
                                        $mergeObjects: [
                                            "$$variation",
                                            {
                                                colors: {
                                                    $filter: {
                                                        input: "$$variation.colors",
                                                        as: "color",
                                                        cond: {
                                                            $eq: ["$$color.name", "$$colorId"]
                                                        }
                                                    }
                                                }
                                            }
                                        ]
                                    }
                                }
                            }
                        }
                    },
                    {
                        $addFields: {
                            id: {
                                $toString: "$_id"
                            }
                        }
                    },
                    {
                        $project: {
                            _id: 0,
                            __v: 0,
                            description: 0
                        }
                    }
                ]
            }
        },
        {
            $project: {
                "cart.productId": 0
            }
        },
        {
            $unwind: "$product"
        },
        {
            $addFields: {
                "cart": {
                    $mergeObjects: ["$product", {
                        quantity: "$cart.quantity"
                    }]
                }
            }
        },
        {
            $unwind: "$cart.variations"
        },
        {
            $unwind: "$cart.variations.colors"
        },
        {
            $group: {
                _id: "$id",
                products: {
                    $push: "$cart"
                }
            }
        },
        {
            $addFields: {
                total: {
                    $reduce: {
                        input: "$products",
                        initialValue: 0,
                        in: {
                            $add: [
                                {
                                    $multiply: [
                                        {
                                            $add: ["$$this.variations.price", "$$this.variations.colors.color_price"]
                                        },
                                        "$$this.quantity"
                                    ]
                                },
                                "$$value"
                            ]
                        }
                    }
                }
            }
        },
        {
            $project: {
                _id: 0
            }
        }
    ],
        // {explain:true}
    ).then((data) => {
        return data[0]
    });

    return cart;
};
user_schema.statics.POST_USER_CART = (userId, cart_data) => {
    const cart = User.updateOne(
        {
            _id: userId,
        },
        {
            $addToSet: {
                "cart": {
                    productId: cart_data.productId,
                    variationId: cart_data.variationId,
                    colorId: cart_data.colorId
                },
            },
        },
        {
            upsert: true,
        }
    );
    return cart;
};
user_schema.statics.DELETE_USER_CART = (userId) => {
    const cart = User.updateOne(
        {
            _id: userId,
        },
        {
            $set: {
                cart: [],
            },
        }
    );
    return cart;
};
user_schema.statics.GET_USER_CART_ITEM = (userId, data) => {
    const cart = User.aggregate([
        {
            $match: {
                _id: mongoose.Types.ObjectId(userId),
            }
        },
        {
            $project: {
                cart: {
                    $filter: {
                        input: "$cart",
                        as: "cart",
                        cond: {
                            $and: [
                                { $eq: ["$$cart.variationId", mongoose.Types.ObjectId(data.variationId)] },
                                { $eq: ["$$cart.colorId", data.colorId] }
                            ]
                        }
                    }
                }
            }
        },
        {
            $unwind: "$cart"
        },
    ]);
    return cart;
};
user_schema.statics.UPDATE_USER_CART_ITEM = (userId, data, operator) => {
    const value = operator === 'INCREMENT' ? 1 : -1;
    const cart = User.updateOne(
        {
            _id: userId,
            "cart.productId": data.productId,
            "cart.variationId": data.variationId,
            "cart.colorId": data.colorId,
        },
        {
            $inc: {
                "cart.$.quantity": value
            },
        }
    );
    return cart;
};
user_schema.statics.DELETE_USER_CART_ITEM = (userId, data) => {
    const cart = User.updateOne(
        {
            _id: userId,
        },
        {
            $pull: {
                cart: {
                    "productId": data.productId,
                    "variationId": data.variationId,
                    "colorId": data.colorId,
                }
            }
        }
    );
    return cart;
};
user_schema.statics.MOVE_TO_WISHLIST = (userId, productId) => {
    const delete_cart = User.updateOne(
        {
            _id: userId,
        },
        {
            $pull: { cart: { productId: mongoose.Types.ObjectId(productId) } },
            $addToSet: {
                wishlist: mongoose.Types.ObjectId(productId),
            },
        },
        {
            upsert: false
        }
    );
    return delete_cart;
};
user_schema.statics.GET_USER_WISHLIST = (userId) => {
    const wishlist = User.aggregate([
        {
            $match: {
                _id: mongoose.Types.ObjectId(userId),
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
            $lookup: {
                from: "products",
                localField: "wishlist.productId",
                foreignField: "_id",
                as: "wishlist",
                pipeline: [
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
                            _v: 0,
                        },
                    },
                ],
            },
        },
        {
            $project: {
                wishlist: 1,
            },
        },
        {
            $project: {
                _id: 0,
            },
        },
    ]);
    return wishlist;
};
user_schema.statics.DELETE_WHISHLIST_PRODUCT = (userId) => {
    const wishlist_product = User.updateOne(
        {
            _id: userId,
        },
        { $pull: { wishlist: { productId: mongoose.Types.ObjectId(productId) } } }
    );
    return wishlist_product;
};
user_schema.statics.GET_USER_SETTINGS = (userId) => {
    const settings = User.aggregate([
        {
            $match: {
                _id: mongoose.Types.ObjectId(userId),
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
                settings: 1
            }
        },
        {
            $project: {
                _id: 0
            }
        }
    ]);
    return settings;
};
user_schema.statics.POST_USER_SETTINGS = (userId, new_settings) => {
    const settings = User.updateOne(
        {
            _id: userId
        },
        {
            $set: { new_settings }
        }
    );
    return settings;
};
user_schema.statics.GET_USER_PAYMENTS = (userId) => {
    const payments = User.aggregate([
        {
            $match: {
                _id: mongoose.Types.ObjectId(userId),
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
                payments: 1,
            },
        },
        {
            $project: {
                _id: 0,
                __v: 0
            }
        },
    ]).then((payments) => {
        const decrypted_payments = payments[0].payments.map((payment_data) => {
            let dec_data = decrypt(payment_data?.encrypted_data);
            dec_data = JSON.parse(dec_data);
            return {
                default_payment: payment_data.default_payment,
                date_added: payment_data?.date_added,
                type: payment_data?.type,
                id: payment_data?._id,
                card_number: dec_data?.card_number?.substr(-4),
                payee_name: dec_data?.payee_name.toUpperCase(),
                card_expiry: dec_data?.card_expiry
            }
        });
        return decrypted_payments
    });
    return payments;
};
user_schema.statics.GET_USER_PAYMENT_BY_ID = (userId, paymentId) => {
    const payment = User.aggregate([
        {
            $match: {
                _id: mongoose.Types.ObjectId(userId),

            },
        },
        { $unwind: "$payments" },
        {
            $match: {
                "payments._id": mongoose.Types.ObjectId(paymentId)
            }
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
                payments: 1
            }
        },
        {
            $project: {
                _id: 0,
                __v: 0
            }
        },
    ]).then((payments) => {
        const payment = payments[0].payments;
        let dec_data = decrypt(payment.encrypted_data);
        dec_data = JSON.parse(dec_data);
        return {
            default_payment: payment.default_payment,
            date_added: payment.date_added,
            type: payment.type,
            id: payment._id,
            payee_name: dec_data.payee_name.toUpperCase(),
            card_number: dec_data.card_number,
            card_expiry: dec_data.card_expiry
        }
    });
    return payment;
};
user_schema.statics.ADD_NEW_PAYMENT = async (userId, payment_data) => {
    const check_payments = await User.GET_USER_PAYMENTS(userId);
    const card_data = JSON.stringify({
        payee_name: payment_data.payee_name,
        card_number: payment_data.card_number,
        card_expiry: payment_data.card_expiry,
    });
    const default_payment = check_payments?.length === 0 ? true : false;
    const encrypted_data = encrypt(card_data);
    const cart = User.updateOne(
        {
            _id: userId,
        },
        {
            $addToSet: {
                "payments": {
                    encrypted_data: encrypted_data,
                    type: payment_data.type,
                    default_payment: default_payment
                },
            },
        },
        {
            upsert: true,
        }
    );
    return cart;
};
user_schema.statics.UPDATE_USER_PAYMENT = async (userId, paymentId, updated_payments) => {
    const payment_data = await User.GET_USER_PAYMENT_BY_ID(userId, paymentId);
    const card_data = JSON.stringify({
        payee_name: updated_payments.payee_name,
        card_expiry: updated_payments.card_expiry,
        card_number: payment_data.card_number,
    });
    const encrypted_data = encrypt(card_data);
    const payments = User.updateOne(
        {
            _id: userId,
            "payments._id": paymentId
        },
        {
            $set: {
                "payments.$": {
                    encrypted_data: encrypted_data,
                    default_payment: payment_data.default_payment,
                    type: payment_data.type
                },
            }
        }
    );
    return payments;
};
user_schema.statics.DELETE_USER_PAYMENT = (userId, paymentId) => {
    const payments = User.updateOne(
        {
            _id: userId,
        },
        { $pull: { payments: { _id: mongoose.Types.ObjectId(paymentId) } } }
    );
    return payments;
};
user_schema.statics.GET_USER_ADDRESS = (userId) => {
    const address = User.aggregate([
        {
            $match: {
                _id: mongoose.Types.ObjectId(userId),
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
                address: 1,
            },
        },
        {
            $project: {
                _id: 0,
            },
        },
    ]).then((data) => {
        return data[0].address;
    });
    return address;
};
user_schema.statics.GET_USER_ADDRESS_BY_ID = (userId, addressId) => {
    const address = User.aggregate([
        {
            $match: {
                _id: mongoose.Types.ObjectId(userId),

            },
        },
        { $unwind: "$address" },
        {
            $match: {
                "address._id": mongoose.Types.ObjectId(addressId)
            }
        },
        {
            $addFields: {
                address: {
                    id: {
                        $toString: "$address._id",
                    },
                }
            },
        },
        {
            $project: {
                address: 1
            }
        },
        {
            $project: {
                _id: 0,
                address: {
                    _id: 0
                },
                __v: 0
            }
        },
    ]).then((address) => {
        return address[0].address
    });
    return address;
};
user_schema.statics.ADD_NEW_ADDRESS = async (userId, address_data) => {
    const check_address_length = await User.GET_USER_ADDRESS(userId);
    const is_default = check_address_length.length === 0 ? true : false;
    const address = User.updateOne(
        {
            _id: userId,
        },
        {
            $addToSet: {
                "address": {
                    name: address_data.name,
                    phone: address_data.phone,
                    line1: address_data.line1,
                    line2: address_data.line2,
                    city: address_data.city,
                    country: address_data.country,
                    postcode: address_data.postcode,
                    is_default: is_default
                },
            },
        },
        {
            upsert: true,
        }
    );
    return address;
};
user_schema.statics.UPDATE_USER_ADDRESS = (userId, addressId, updated_address) => {
    console.log(updated_address);
    const address = User.updateOne(
        {
            _id: userId,
            "address._id": addressId
        },
        {
            $set: {
                "address.$": {
                    name: updated_address.name,
                    phone: updated_address.phone,
                    line1: updated_address.line1,
                    line2: updated_address.line2,
                    city: updated_address.city,
                    country: updated_address.country,
                    postcode: updated_address.postcode,
                    is_default: updated_address.is_default
                },
            }
        }
    );
    return address;
};
user_schema.statics.SET_DEFAULT_ADDRESS = (userId, addressId) => {
    const updated_address =
        User.updateOne(
            {
                _id: userId,
                "address._id": addressId
            },
            {
                $set: {
                    "address.$[elem].is_default": true,
                    "address.$[other].is_default": false
                }
            },
            {
                arrayFilters: [
                    { "elem._id": addressId },
                    { "other._id": { $ne: addressId } }
                ]
            }
        );
    return updated_address;
};
user_schema.statics.DELETE_USER_ADDRESS = async (userId, addressId) => {
    const check_default = await User.GET_USER_ADDRESS_BY_ID(userId, addressId);
    const delete_pull = [
        {
            updateOne: {
                filter: { _id: userId },
                update: {
                    $pull: { address: { _id: mongoose.Types.ObjectId(addressId) } }
                }
            }
        }
    ];
    const set_first_default = [
        {
            updateOne: {
                filter: { _id: userId },
                update: {
                    $pull: { address: { _id: mongoose.Types.ObjectId(addressId) } }
                }
            }
        },
        {
            updateOne: {
                filter: { _id: userId, "address.0": { $exists: true } },
                update: {
                    $set: { "address.0.is_default": true }
                }
            }
        }
    ];
    const address = User.bulkWrite(check_default.is_default === true ? set_first_default : delete_pull)
    return address;
};
user_schema.statics.UPDATE_USER_MEMBERSHIP = (userId) => {
    const membership_update = User.updateOne(
        {
            _id: userId,
        },
        { $set: { subscription: 'PREMIUM' } }
    );
    return membership_update;
};
const User = mongoose.model("User", user_schema);
export default User;




