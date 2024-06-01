


const errorMiddleware = (error, req, res, next) => {
    const status = error.statusCode || 500;
    const message = error.message;
    return res.status(status).json({ message });
};

const TryCatch = (controller) => async (req, res, next) => {
    try {
        await controller(req, res, next);
    } catch (error) {
        next(error);
    }
};

export { errorMiddleware, TryCatch };