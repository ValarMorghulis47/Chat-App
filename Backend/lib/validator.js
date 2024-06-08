
import { body, param, validationResult } from "express-validator";
import { ErrorHandler } from "../utils/utility.js";

const validateHandler = (req, res, next) => {
    const errors = validationResult(req);
    console.log(errors);
    const errorMessages = errors
        .array()
        .map((error) => error.msg)
        .join(", ");

    if (errors.isEmpty()) return next();
    else next(new ErrorHandler(errorMessages, 400));
};

const registerValidator = () => [
    body("email").notEmpty().withMessage("Please Enter Email").bail().isEmail().withMessage("Invalid Email"),
    body("username", "Please Enter Username").notEmpty(),
    body("bio", "Please Enter Bio").notEmpty(),
    body("password", "Please Enter Password").notEmpty(),
];

const loginValidator = () => [
    body("email").notEmpty().withMessage("Please Enter Email").bail().isEmail().withMessage("Invalid Email"),
    body("password", "Please Enter Password").notEmpty(),
];

const newGroupValidator = () => [
    body("name", "Please Enter Name").notEmpty(),
    body("members")
        .notEmpty()
        .withMessage("Please Enter Members")
        .isArray({ min: 2, max: 100 })
        .withMessage("Members must be 2-100"),
];

const addMemberValidator = () => [
    body("chatId", "Please Enter Chat ID").notEmpty(),
    body("members")
        .notEmpty()
        .withMessage("Please Enter Members")
        .isArray({ min: 1, max: 97 })
        .withMessage("Members must be 1-97"),
];

const removeMemberValidator = () => [
    body("chatId", "Please Enter Chat ID").notEmpty(),
    body("userId", "Please Enter User ID").notEmpty(),
];

const leaveGroupValidator = () => [
    body("chatId", "Please Enter Chat ID").notEmpty(),
];

const sendAttachmentsValidator = () => [
    body("chatId", "Please Enter Chat ID").notEmpty(),
];

const chatIdValidator = () => [param("id", "Please Enter Chat ID").notEmpty()];

const renameValidator = () => [
    param("id", "Please Enter Chat ID").notEmpty(),
    body("name", "Please Enter New Name").notEmpty(),
];

const deleteGroupValidator = () => [
    param("id", "Please Enter Chat ID").notEmpty(),
];

const getMessagesValidator = () => [
    param("id", "Please Enter Chat ID").notEmpty(),
];

const sendRequestValidator = () => [
    body("receiverId", "Please Enter Receiver ID").notEmpty(),
];

const acceptRequestValidator = () => [
    body("requestId", "Please Enter Request ID").notEmpty(),
    body("accept")
        .notEmpty()
        .withMessage("Please Add Accept")
        .isBoolean()
        .withMessage("Accept must be a boolean"),
];

const adminLoginValidator = () => [
    body("secretKey", "Please Enter Secret Key").notEmpty(),
];

export {
    acceptRequestValidator,
    addMemberValidator,
    adminLoginValidator,
    chatIdValidator,
    loginValidator,
    newGroupValidator,
    registerValidator,
    removeMemberValidator,
    leaveGroupValidator,
    renameValidator,
    deleteGroupValidator,
    getMessagesValidator,
    sendAttachmentsValidator,
    sendRequestValidator,
    validateHandler,
};
