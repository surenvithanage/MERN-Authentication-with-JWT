const db = require("../models");
const ROLES = db.ROLES;
const User = db.user;

checkDuplicateUsernameOrEmail = (req, res, next) => {
    User.findOne({
        username: req.body.username
    }).exec((err, data) => {
        if (err) {
            res.status(500).send({ message: err });
            return;
        }
        if (data) {
            res.status(400).send({ message: "Username already in use." });
            return;
        }
        User.findOne({
            email: req.body.email
        }).exec((err, data) => {
            if (err) {
                res.status(500).send({ message: err });
                return;
            }
            if (data) {
                res.status(400).send({ message: "Email already in use." });
                return;
            }
            // next
            // a function in the Express router which, when invoked, executes the middleware succeeding the current middleware
            next();

            // lines executed below next will be triggered once the checkRolesExisted method is completed
        })
    })
}

checkRolesExisted = (req, res, next) => {
    if (req.body.roles) {
        for(let i = 0; i < req.body.roles.length; i++) {
            if (!ROLES.includes(req.body.roles[i])) {
                res.status(400).send({
                    message: `Role ${req.body.roles[i]} does not exist.`
                });
                return;
            }
        }
    }
    next();
}

const verifySignUp = {
    checkDuplicateUsernameOrEmail,
    checkRolesExisted
};

module.exports = verifySignUp;