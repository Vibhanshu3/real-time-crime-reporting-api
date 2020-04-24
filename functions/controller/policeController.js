const { DB, firebase, storageRef, bucket, storage } = require("../config/config.js");
const admin = require('firebase-admin');

module.exports.viewAllPendingReport = (req, res) => {

    //for police only:
    const reportRef = DB.collection('Reports');
    console.log("in view all pending report");

    let reports = [];
    reportRef
        .where('status', '==', 'pending')
        .get()
        .then(function (querySnapshot) {
            querySnapshot.forEach(function (doc) {
                const id = doc.id;
                const report = {
                    ...doc.data(),
                    id
                }
                reports.push(report);

            });

            return res.status(200).send(reports);
        })
        .catch(function (error) {
            console.log("Error getting documents: ", error);
            res.status(500).send({ ERROR: "Error getting documents:" })
        });
};

module.exports.tracker = (req, res) => {
    try {
        const { lat, long, user_id } = req.body;

        const trackerRef = DB.collection('Tracker').doc(user_id);
        let query = trackerRef.get()
            .then(snapshot => {
                if (snapshot.data() === undefined) {
                    trackerRef
                        .set({
                            lat,
                            long,
                            user_id

                        }).then(ref => {
                            return res.status(200).send("Data updated successfully");

                        }).catch(err => {
                            return res.status(500).send(err);
                        });

                    return;
                }

                trackerRef.update({
                    lat,
                    long
                }).then(snapshot => {
                    return res.status(200).send("Data updated successfully");

                }).catch(err => {
                    return res.status(500).send(err);
                });

                return null;
            })
            .catch(err => {
                return res.status(500).send(err);
            });

    } catch (err) {
        console.log('Error getting documents', err);
        return res.status(500).send("Data didnt uploaded");

    }
};

module.exports.alertUser = (req, res) => {
    const usersRef = DB.collection('Users');
    console.log("in alert user");

    let registrationTokensOfDevice = [];
    usersRef
        .get()
        .then(function (querySnapshot) {
            querySnapshot.forEach(function (doc) {
                console.log(doc.data().device_token);
                var device_token = doc.data().device_token;
                if (device_token !== undefined)
                    registrationTokensOfDevice.push(device_token);
            });
            console.log(registrationTokensOfDevice);
            const registrationTokens = registrationTokensOfDevice;

            //FCM

            return null;
        })
        .catch(function (error) {
            console.log("Error getting documents: ", error);
            res.status(500).send({ ERROR: "Error getting documents:" })
        });

    // const message = {
    //     data: { score: '850', time: '2:45' },
    //     tokens: registrationTokens,
    // }

    // admin.messaging().sendMulticast(message)
    //     .then((response) => {
    //         console.log(response.successCount + ' messages were sent successfully');

    //     })
}