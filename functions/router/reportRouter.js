const express = require("express");
const reportRouter = express.Router();

const {
    addReport,
    viewReport,
} = require("../controller/reportController");

const {
    isUserVerified
} = require("../controller/authController");

reportRouter.use(isUserVerified);

reportRouter
    .route("")
    .post(addReport);

reportRouter
    .route("/userall")
    .get(viewReport)

module.exports = reportRouter;