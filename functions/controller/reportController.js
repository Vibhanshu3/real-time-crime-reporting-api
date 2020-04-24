const { DB, firebase, storageRef, bucket, storage } = require("../config/config.js");
const admin = require('firebase-admin');

const Busboy = require('busboy');
const path = require('path');
const os = require('os');
const fs = require('fs');

function getUserID(user) {
    return new Promise(function (resolve, reject) {
        const userRef = DB.collection('Users');

        let query = userRef.where("email", "==", user.email).get()
            .then(async snapshot => {
                snapshot.forEach(async doc => {
                    const user_id = doc.id;
                    console.log(user_id)
                    resolve(user_id);
                });
                return null;
            })
            .catch(err => {
                console.log('Error getting documents', err);
                return res.status(500).send("Something went wrong!");
            });
    })
}

const imageParsing = (req, res) => {
    const user = req.body.user;

    const busboy = new Busboy({
        headers: req.headers,
        limits: {
            fileSize: 10000 * 1024 * 1024 * 1024,
        }
    });

    const fields = {};
    const files = [];
    const fileWrites = [];

    busboy.on('field', (key, value) => {
        fields[key] = value;

    });

    console.log(fields);

    let paths = null;

    busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {

        const filepath = path.join(os.tmpdir(), filename);
        console.log(`Handling file upload field ${fieldname}: ${filename} (${filepath})`);
        paths = filepath;
        const writeStream = fs.createWriteStream(filepath);

        file.pipe(writeStream);
        fileWrites.push(new Promise((resolve, reject) => {
            file.on('end', () => writeStream.end());
            writeStream.on('finish', () => {
                fs.readFile(filepath, (err, buffer) => {
                    const size = Buffer.byteLength(buffer);
                    console.log(`${filename} is ${size} bytes`);
                    if (err) {
                        return reject(err);
                    }

                    files.push({
                        fieldname,
                        originalname: filename,
                        encoding,
                        mimetype,
                        buffer,
                        size,
                        filepath
                    });

                    resolve();
                });
            });
            writeStream.on('error', reject);

        }));
    });

    busboy.on('finish', () => {
        Promise.all(fileWrites)
            .then(() => {
                req.body.data = fields;
                req.files = files;
                uploadImage(req, res, user);

                return null;
            })
            .catch((err) => {
                res.json({
                    ERROR: err
                })
            });
    });

    busboy.end(req.rawBody);
}

const uploadImage = async (req, res, user) => {
    let urls = [];
    var i = 0;
    var user_id = await getUserID(user);

    req.files.forEach(async (imageFile) => {
        console.log(imageFile.filepath);
        await bucket.upload(imageFile.filepath, {
            gzip: true,
            destination: `${user_id}/${imageFile.originalname}`,
            metadata: {
                cacheControl: 'public, max-age=31536000'
            }
        }).then(async (data) => {
            let file = data[0];
            await file.getSignedUrl({
                action: 'read',
                expires: '03-17-2025'
            }, async function (err, url) {
                if (err) {
                    console.error(err);
                    return;
                }
                // handle url 
                i++;
                urls.push(url);
                if (i === req.files.length) {
                    console.log(urls);
                    uploadReport(req, res, urls, user_id);
                }
            })
            return null;
        }).catch((err) => {
            res.json({
                ERROR: 'Failed to upload: ' + JSON.stringify(err)
            })
        });
    });
}

let report;
const uploadReport = async (req, res, urls, user_id) => {
    try {
        const reportInfo = req.body.data;
        const response = await DB.collection('Reports')
            .add(report = {
                user_id,
                lat: reportInfo.lat,
                long: reportInfo.long,
                desc: reportInfo.desc,
                files: urls,
                status: "pending"

            }).then(async ref => {
                console.log('Added Report with ID: ', ref.id);

                const user = req.body.user;
                const userRef = DB.collection('Users');

                var user_id = await getUserID(user);
                updateUser(req, res, ref.id, user, user_id);

                return null;
            });

    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
};

const updateUser = async (req, res, report_id, user, user_id) => {
    const userRef = DB.collection('Users').doc(user_id);
    let queryDocumentSnapshot = await userRef.get();
    let newUser = queryDocumentSnapshot.data();

    if (newUser.reports === undefined) {
        await userRef.set({
            ...user,
            reports: [report_id]

        }, { merge: true }).then(snapshot => {
            //success
            console.log("Data updated successfully");

            return res.status(200).send("Data updated successfully");
        }).catch(err => {
            console.log('Error getting documents', err);
            return res.status(500).send("Data didnt uploaded");

        });

    } else {
        await userRef.update({
            ...user,
            reports: admin.firestore.FieldValue.arrayUnion(report_id)

        }).then(snapshot => {
            //success
            console.log("Data updated successfully");
            return res.status(200).send("Data updated successfully");

        }).catch(err => {
            console.log('Error getting documents', err);
            return res.status(500).send("Data didnt uploaded");
        });
    }
};

module.exports.addReport = async function (req, res) {
    try {
        imageParsing(req, res);

    } catch (err) {
        return res.send(err);

    }
};

function getReports(userReport) {
    return new Promise(function (resolve, reject) {
        DB.collection('Reports').doc(userReport).get()
            .then((snapshot) => {
                const report = snapshot.data();

                resolve(report);
                return null;
            })
            .catch(err => {
                console.log('Error getting documents', err);
                return res.status(200).send("Something went wrong!");
            });
    });
}

module.exports.viewReport = async function (req, res) {
    try {
        const oldUser = req.body.user;
        const userRef = DB.collection('Users');
        let query = userRef.where("email", "==", oldUser.email).get()
            .then((snapshot) => {
                snapshot.forEach(async doc => {
                    const newUser = doc.data();
                    const userReports = newUser.reports;

                    const promise = Promise.all(userReports.map(getReports))
                    const result = await promise;
                    return res.status(200).send(result);

                });
                return null
            })
            .catch(err => {
                console.log('Error getting documents', err);
                return res.status(500).send("Something went wrong!");
            });
    } catch (err) {
        console.log('Error getting documents', err);
        return res.status(500).send("Something went wrong!");
    }
}


