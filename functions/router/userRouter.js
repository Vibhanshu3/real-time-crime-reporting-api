const express = require("express");
const userRouter = express.Router();

const {
    addUser,
    getUser,
    getAllUsers,
    updateUser
} = require("../controller/userController");

const {
    signUp,
    login,
    isUserVerified,
    saveDeviceToken
} = require("../controller/authController");

userRouter
    .route("")
    .get(getAllUsers)

userRouter
    .route("/isuser")
    .post(isUserVerified);

userRouter
    .route("/login")
    .post(login);

userRouter
    .route("/signup")
    .post(signUp);

userRouter
    .route("/savedevicetoken")
    .post(isUserVerified, saveDeviceToken);

userRouter
    .route("/:id")
    .get(getUser)
    .patch(updateUser)

module.exports = userRouter;