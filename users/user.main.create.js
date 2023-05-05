const con = require('../dbConnection');
const bcrypt = require('bcryptjs');
const user = require('./user.config.json');

createUser();
function createUser() {
    con.query(
        `SELECT * FROM users WHERE LOWER(email) = LOWER(${con.escape(
            user.email
        )});`,
        (err, result) => {
            if (result.length) {
                return res.status(409).send({
                    msg: 'User Exist'
                });
            } else {
                // username is available
                bcrypt.hash(user.password, 10, (err, hash) => {
                    con.query(
                        `INSERT INTO users (fname, lname, email, password, role) VALUES ('${user.fname}', '${user.lname}', ${con.escape(user.email)}, ${con.escape(hash)}, '${user.role}')`,
                        (err, result) => {
                            if (err) {
                                throw err;
                                return res.status(400).send({
                                    msg: err
                                });
                            }
                            console.log('register success');
                        }
                    );
                });
            }
        }
    );
}