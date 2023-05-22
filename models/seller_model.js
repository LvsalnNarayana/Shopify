import mongoose, { Schema } from 'mongoose';
const schema = mongoose.Schema;
const seller_schema = new Schema({
    name: {
        type: String,
    },
    email: {
        type: String
    },
    password: {
        type: String
    },
    phone: {
        type: String
    },
    address: {
        type: String
    },
    feedback: [
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
    ]
},
    {

    });
const Selller = mongoose.model("seller", seller_schema);
export default Selller;