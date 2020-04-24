const functions = require('firebase-functions');
const cors = require('cors');
var bodyParser = require('body-parser');
const express = require('express');
const app = express();

// const fileUpload = require('express-fileupload');

const userRouter = require("./router/userRouter.js");
const reportRouter = require("./router/reportRouter.js");
const policeRoute = require("./router/policeRoute.js");

app.use(cors());
app.use(express.json());

// bodyParser = {
//     json: { limit: '50mb', extended: true },
//     urlencoded: { limit: '50mb', extended: true }
// };
app.use(bodyParser.json({limit: '100mb', extended: true}))
app.use(bodyParser.urlencoded({ limit: '100mb', extended: true }))

// app.use(express.urlencoded({ extended: true }))


app.use("/users", userRouter);
app.use("/report", reportRouter);
app.use("/police", policeRoute);

exports.app = functions.https.onRequest(app);

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions


