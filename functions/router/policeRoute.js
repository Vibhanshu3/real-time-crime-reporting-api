const express = require("express");
const policeRoute = express.Router();

const {
    alertUser,
    viewAllPendingReport,
    tracker
} = require("../controller/policeController.js");

const {
    isPoliceVerified
} = require("../controller/authController");

policeRoute.use(isPoliceVerified);

policeRoute
    .route("/allpendingreport")
    .get(viewAllPendingReport)

policeRoute
    .route("/alertusers")
    .get(alertUser);

policeRoute
    .route("/starttracker")
    .post(tracker)

module.exports = policeRoute;