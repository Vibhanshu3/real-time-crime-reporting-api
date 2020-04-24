const { KEY, DB } = require("../config/config.js");
var jwt = require('jsonwebtoken');

module.exports.signUp = async function (req, res) {

    let user = "";

    const userRef = DB.collection('Users');
    let query = userRef.where("email", "==", req.body.email).get()
        .then(async snapshot => {
            if (!snapshot.empty) {
                console.log('User already exist with this email ID');
                return res.json({ ERROR: "User already exist with this email ID" });

            } else {
                const response = await DB.collection('Users')
                    .add(user = {
                        name: req.body.name,
                        email: req.body.email,
                        phone: req.body.phone,
                        password: req.body.password,
                        role: "citizen"

                    }).then(ref => {
                        console.log('Added document with ID: ', ref.id);

                        //generate token
                        const token = jwt.sign(user, KEY);
                        const id_ = ref.id;
                        const data = {
                            ...user,
                            token
                        }
                        return res.json({
                            code: "200",
                            data
                        })

                    }).catch(err => {
                        console.log(err);
                        return res.status(500).send(err);

                    });
            }

            return null;
        });
}

module.exports.saveDeviceToken = (req, res) => {
    try {
        const user = req.body.user;
        const userRef = DB.collection('Users');
        let user_id;

        let query = userRef.where("email", "==", user.email).get()
            .then(snapshot => {
                if (snapshot.empty) {
                    console.log('No matching documents.');
                    return null;
                }
                snapshot.forEach(async doc => {
                    user_id = doc.id;
                });

                userRef.doc(user_id).update({
                    device_token: req.body.device_token

                }).then(snapshot => {
                    //success
                    console.log("Data updated successfully");
                    return res.status(200).send("Data updated successfully");
                }).catch(err => {
                    console.log('Error getting documents', err);
                    return res.status(500).send(err);

                });

                return null;
            })
            .catch(err => {
                console.log('Error getting documents', err);
                return res.status(500).send(err);
            });

    } catch (err) {
        return res.status(500).send(err);

    }
}

module.exports.login = async function (req, res) {

    const { email, password } = req.body;
    const userRef = DB.collection('Users');

    let query = userRef.where("email", "==", email).get()
        .then(async snapshot => {
            if (snapshot.empty) {
                console.log('No matching documents.');
                return null;
            }

            console.log(snapshot);
            let token = "";
            let user = "";
            await snapshot.forEach(async doc => {
                user = doc.data();
                const user_id = doc.id;
                console.log(user);
                const dbPassword = user.password;
                if (dbPassword === password) {
                    token = await jwt.sign(user, KEY);

                }
            });

            if (token === "") {
                return res.status(500).send("incorrect email or password");
            }
            else {
                const data = {
                    ...user,
                    token

                }
                return res.json({
                    code: "200",
                    data
                })
            }

        })
        .catch(err => {
            console.log('Error getting documents', err);
            return res.status(500).send("incorrect email or password");
        });
}

module.exports.isUserVerified = async function (req, res, next) {

    try {
        if (req.headers && req.headers.authorization) {
            console.log("in user verified");
            console.log(req.headers.authorization.split(' ')[1]);

            const user = await jwt.verify(req.headers.authorization.split(' ')[1], KEY);

            if (user) {
                console.log(user);
                req.body.user = user;
                next();
                return null;

            } else {
                return res.json({
                    ERROR: 'Your token has been tempered'
                });
            }
        } else {
            next();
            return null;

        }
    } catch (err) {
        return res.json({
            ERROR: "Error getting user token"
        })
    }
};

module.exports.isPoliceVerified = async (req, res, next) => {
    try {
        
        if (req.headers && req.headers.authorization) {
            console.log("in police verified");

            const police = await jwt.verify(req.headers.authorization.split(' ')[1], KEY);
            console.log(police);

            if (police) {
                console.log(police);
                req.body.police  = police;
                if(police.role === "police") {
                    next();
                    return null;

                } else {
                    return res.json({
                        ERROR: 'Your token has been tempered'
                    });

                }
            } else {
                return res.json({
                    ERROR: 'Your token has been tempered'
                });
            }
        } else {
            return res.json({
                ERROR: 'No police '
            });

        }
    } catch (err) {
        return res.json({
            ERROR: "Error getting police token"
        })
    }
};