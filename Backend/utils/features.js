import mongoose from "mongoose"


const connectDB = async()=>{
    try {
       const obj = await mongoose.connect(`${process.env.MONGODB_URI}/${process.env.MONGODB_DB_NAME}`);
        console.log(`Database connected. DB Connection Host: ${obj.connection.host}`);
    }
    catch (error) {
        console.log(`Database Connection Error: ${error.message}`);
        process.exit(1);
    }
}


export{
    connectDB
}