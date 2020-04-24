const { DB } = require("../config/config.js");


module.exports.addUser = async function (req, res) {

    try {
        const response = await DB.collection('Users')
            .add({
                name: req.body.name,
                email: req.body.email,
                city: req.body.city,
                password: req.body.password
            }).then(ref => {
                console.log('Added document with ID: ', ref.id);
                return res.json({
                    ref
                })
            });

    } catch (err) {
        console.log(err);
        return res.status(200).send(err);

    }
}

module.exports.getUser = async function (req, res) {
    try {
        const document = DB.collection('Users').doc(req.params.id);
        let queryDocumentSnapshot = await document.get();
        let user = queryDocumentSnapshot.data();

        return res.status(200).send(user);

    } catch (err) {
        console.log(err);
        return res.status(200).send(err);

    }
}

module.exports.getAllUsers = async function (req, res) {
    let userRef = DB.collection('Users');
    let query = userRef.get()
        .then(snapshot => {
            if (snapshot.empty) {
                console.log('No matching documents.');
                return;
            }
            var response = [];
            snapshot.forEach(doc => {
                console.log(doc.id, '=>', doc.data());
                response.push(doc.data());
            });

            res.json(
                response
            )

            return null;
        })
        .catch(err => {
            console.log('Error getting documents', err);
        });
}

module.exports.updateUser = async function (req, res) {
    const userRef = DB.collection('Users').doc(req.params.id);
    console.log(req.body["name"]);
    await userRef.update({
        city: req.body.city,
        email: req.body.email,
        name: req.body.name,
        password: req.body.password

    }).then(snapshot => {
            //success
            console.log("Data updated successfully");
            return null;  // returns could not handle req.
        })
        .catch(err => {
            console.log('Error getting documents', err);
        });

}