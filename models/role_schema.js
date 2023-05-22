import mongoose, { Schema, model } from "mongoose";
const schema = mongoose.Schema;

const role_schema = new schema({
    role: {
        type: String,
        immutable: true,
        default: 'user',
        uppercase: true
    },
    permissions: [
        {
            permission: {
                type: String,
                default: 'read',
                uppercase: true
            }
        }
    ]
})
const Roles = new model('Roles', role_schema);
export default Roles;