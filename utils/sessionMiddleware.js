import session from 'express-session';
import { default as connectMongodbSession } from 'connect-mongodb-session';
import dotenv from 'dotenv';
dotenv.config();
const MongoDBStore = connectMongodbSession(session);
export const store = new MongoDBStore({
    uri: process.env.MONGODB_URI,
    collection: 'sessions',
});
export const sessionMiddleware = session({
    cookie: {
        maxAge: 24 * 60 * 60 * 1000,
        httpOnly: false,
    },
    name: 'utk',
    secret: process.env.JWT_SECRET,
    saveUninitialized: false,
    resave: true,
    store: store,
});