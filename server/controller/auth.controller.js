const config = require("../config/auth.config");
const db = require("../models");
const User = db.user;
const Role = db.role;

var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");
const { user } = require("../models");

exports.signup = (req, res) => {
    const user = new User({
        username: req.body.username,
        email: req.body.email,
        password: bcrypt.hashSync(req.body.password, 8)
    });

    user.save((err, data) => {
        if (err) {
            res.status(500).send({ message: err });
            return;
        }
        if (req.body.roles) {
            Role.find({
                name: { $in: req.body.roles }
            }, (err, data) => {
                if (err) {
                    res.status(500).send({ message: err });
                    return;
                }
                user.roles = data.map(role => role._id);
                user.save(err => {
                    if (err) {
                        res.status(500).send({ message: err });
                        return;
                    }
                    res.status(200).send({ message: "User registered successfully" });
                });
            });
        } else {
            Role.findOne({ name: "user" }, (err, data) => {
                if (err) {
                    res.status(500).send({ message: err });
                    return;
                }
                user.roles = [data.id];
                user.save(err => {
                    if (err) {
                        res.status(500).send({ message: err });
                        return;
                    }
                    res.status(200).send({ message: "User registered successfully" });
                });
            });
        }
    });
}

exports.signin = (req, res) => {
    User.findOne({
        username: req.body.username
    })
        .populate("roles", "-__v")
        .exec((err, data) => {
            if (err) {
                res.status(500).send({ message: err });
                return;
            }
            if (!data) {
                return res.status(404).send({ message: "User not found" });
            }
            var passwordIsValid = bcrypt.compareSync(
                req.body.password,
                data.password
            );
            if (!passwordIsValid) {
                return res.status(401).send({
                    accessToken: null,
                    message: "Invalid credentials"
                });
            }
            var token = jwt.signin({ id: user.id }, confid.secret, {
                expiresIn: 86400 // 24 hours
            });
            var authorities = [];
            for (let i = 0; i < data.roles.length; i++) {
                authorities.push("ROLE_" + data.roles[i].name.toUpperCase());
            }
            res.status(200).send({
                id: user._id,
                username: data.username,
                email: data.email,
                roles: authorities,
                accessToken: token
            });
        });
}