const functions = require('firebase-functions');
const admin = require('firebase-admin');
const firebase = require('firebase/app');
var serviceAccount = require("./permission.json");

let config = require('../env.json');

if (Object.keys(functions.config()).length)
  config = functions.config();

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: config.service.database_url
});

const firebaseConfig = {
  apiKey: config.service.api_key,
  authDomain: config.service.auth_domain,
  databaseURL: config.service.database_url,
  projectId: config.service.project_id,
  storageBucket: config.service.storage_bucket,
  messagingSenderId: config.service.messaging_sender_id,
  appId: config.service.app_id
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

const { Storage } = require('@google-cloud/storage');
const storage = new Storage({
  projectId:  config.service.project_id,
  keyFilename: "config/permission.json"
});

const bucket = storage.bucket("gs://databaseapp-9d45e.appspot.com");

module.exports = {
  DB: admin.firestore(),
  storageRef: admin.storage(),
  KEY: "asdkfdkfhskd",
  bucket,
  storage
};