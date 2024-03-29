const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


const UsersLogin = require('../models/usersLogin');

//Create a new user for a new webToken
router.post("/signup", (req, res, next) => {
    UsersLogin.find({email: req.body.email})
    .exec()
    .then(usersLogin => {
        if(usersLogin.length >= 1) {
            return res.status(409).json({
                message: 'Mail exists'
            })
        } else {
            bcrypt.hash(req.body.password, 10, (err, hash) => {
                if(err) {
                    return res.status(500).json({
                        error: err
                    });
                } else {
                    const usersLogin = new UsersLogin({
                        _id: new mongoose.Types.ObjectId(),
                        email: req.body.email,
                        password: hash
                    });
                    usersLogin
                    .save()
                    .then(result => {
                        console.log(result);
                        res.status(201).json({
                            message: 'User Login Created'
                        });
                    })
                    .catch(err => {
                        console.log(err);
                        res.status(500).json({
                            error: err
                        });
                    })
                }
            })
        }
    })
});

//User can login with email and password
router.post("/login", (req, res, next) => {
    UsersLogin.find({ email: req.body.email })
    .exec()
    .then(usersLogin =>{
        if(usersLogin.length < 1) {
            return res.status(401).json({
                message: "Auth failed"
            });
        }
        bcrypt.compare(req.body.password, usersLogin[0].password, (err, result) => {
            if(err) {
                return res.status(401).json({
                    message: "Auth failed"
                });
            }
            if(result) {
                const token = jwt.sign(
                {
                    email: usersLogin[0].email,
                    userId: usersLogin[0]._id
                }, 
                "" + process.env.JWT_KEY,
                {
                    expiresIn: "1h"
                }
                );
                return res.status(200).json({
                    message: "Auth successful",
                    token: token
                });
            }
            res.status(401).json({
                message: "Auth failed"
            });
        });
    })
    .catch(err => {
        res.status(500).json({
            error: err
        });
    });
});

//user can be deleted from the system
router.delete("/:userloginId", (req, res, next) => {
    UsersLogin.remove({ _id: req.params.userloginId })
    .exec()
    .then(result => {
        res.status(200).json({
            message: "User Login deleted"
        });
    })
    .catch(err => {
        res.status(500).json({
            error: err
        })
    })
})

module.exports = router;