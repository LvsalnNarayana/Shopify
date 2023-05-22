import mongose from 'mongoose';

const connectDB = async () => {
    try {
        mongose.set('strictQuery', false);
        mongose.connect(process.env.MONGODB_URI);
    } catch (error) {
        console.log("test passed");
        console.log(error);
        process.exit(1)
    }
}
export default connectDB