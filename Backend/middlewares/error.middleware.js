


const errorMiddleware = (err, req, res, next) => {
    err.message ||= "Internal Server Error";
    err.statusCode ||= 500;
  
    // const response = {
    //   success: false,
    //   message: err.message,
    // };
  
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  };

const TryCatch = (controller) => async (req, res, next) => {
    try {
        await controller(req, res, next);
    } catch (error) {
        next(error);
    }
};

export { errorMiddleware, TryCatch };