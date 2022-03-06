const jwt = require("jsonwebtoken");
const config = require("../config/auth.config");
const { user } = require("../models");
const db = require("../models");
const User = db.user;
const Role = db.role;

verifyToken = (req, res, next) => {
    let token = req.headers["x-access-token"];
    if (!token) {
        return res.status(403).send({ message: "No token provided" });
    }
    jwt.verify(token, config.secret, (err, decoded) => {
        if (err) {
            return res.status(401).send({ message: "Unauthorized" });
        }
        req.userId = decoded.id;
        next();
    });
}

isAdmin = (req, res, next) => {
    User.findById(req.userId).exec((err,data) => {
        if (err) {
            res.status(500).send({message: err});
        }
        Role.find({
            _id: {$in: data.roles}
        }, (err, data) => {
            if (err) {
                res.status(500).send({message: err});
            }
            for (let i = 0; i < data.length; i++) {
                if (data[i].name === 'admin') {
                    next();
                    return;
                }
            }
            res.status(403).send({message: "Need Admin privileges"});
        });
    });
}

isModerator = (req, res, next) => {
    User.findById(req.userId).exec((err, data) => {
        if (err) {
            res.status(500).send({message: err});
        }
        Role.find({
            _id: { $in: data.roles}
        }, (err, data) => {
            if (err) {
                res.status(500).send({message :err});
            }

            for (let i = 0; data.length; i++) {
                if (data[i]['name'] === 'moderator') {
                    next();
                    return;
                }
            }
        });
    });
}

const authJwt = {
    verifyToken,
    isAdmin,
    isModerator
}

module.exports = authJwt;

