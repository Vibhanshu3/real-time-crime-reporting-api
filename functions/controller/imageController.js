module.exports = (req, res) => {
    const user = req.body.user;

    const busboy = new Busboy({
        headers: req.headers,
        limits: {
            fileSize: 10 * 1024 * 1024,
        }
    });

    const fields = {};
    const files = [];
    const fileWrites = [];

    busboy.on('field', (key, value) => {
        fields[key] = value;

    });

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
                // console.log(req.body.data);
                console.log(req.files);

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