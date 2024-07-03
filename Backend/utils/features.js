import mongoose from "mongoose"
import { v2 as cloudinary } from "cloudinary"
import { v4 as uuid } from "uuid"
import { getBase64, getSockets } from "../lib/helper.js";


const connectDB = async () => {
  try {
    const obj = await mongoose.connect(`${process.env.MONGODB_URI}/${process.env.MONGODB_DB_NAME}`);
    console.log(`Database connected. DB Connection Host: ${obj.connection.host}`);
  }
  catch (error) {
    console.log(`Database Connection Error: ${error.message}`);
    process.exit(1);
  }
}

const emitEvent = (req, event, users, data) => {
  console.log("Emitting event", event, "to users", users);
  const io = req.app.get('io');
  const userSockets = getSockets(users);
  io.to(userSockets).emit(event, data);
}

const UploadFilesCloudinary = async (files = [], folderName) => {
  const uploadPromises = files.map((file) => {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload(
        getBase64(file),
        {
          resource_type: "auto",
          public_id: uuid(),
          folder: folderName,
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );
    });
  });

  try {
    const results = await Promise.all(uploadPromises);

    const formattedResults = results.map((result) => ({
      public_id: result.public_id,
      url: result.secure_url,
    }));
    return formattedResults;
  } catch (err) {
    throw new Error("Error uploading files to cloudinary", err);
  }
};

const DeleteFilesCloudinary = async (public_ids = []) => {
  const deletePromises = public_ids.map((public_id) => {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.destroy(public_id, (error, result) => {
        if (error) return reject(error);
        resolve(result);
      });
    });
  });

  try {
    await Promise.all(deletePromises);
  } catch (err) {
    throw new Error("Error deleting files from cloudinary", err);
  }
};

export {
  connectDB,
  emitEvent,
  UploadFilesCloudinary,
  DeleteFilesCloudinary
}