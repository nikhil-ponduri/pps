import users from "../models/users.models";
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { serverError, badRequest, SECRETKEY } from "../utils/constants";
import profilesModel from "../models/users.profiles.model";
import usersModels from "../models/users.models";

export const loginUser = (req, res) => {
    const { email, password } = req.body;
    users.findOne({ email }).then(user => {
        if (!user) return badRequest(res, 'User not found');
        bcrypt.compare(password, user.password, (err, isValid) => {
            if (err) {
                console.log(err)
                return serverError(res);
            }
            if (!isValid) return badRequest(res, 'Invalid credentials');
            jwt.sign({ id: user._id, email: user.email }, SECRETKEY, (err, token) => {
                if (err) {
                    console.log(err)
                    return serverError(res);
                }
                return res.json({ token });
            })
        })
    }).catch(err => {
        console.log(err);
        return serverError(res);
    })
}

export const registerUser = (req, res) => {
    const { email, password } = req.body;
    users.findOne({ email }, (err, user) => {
        if (err) return serverError(res)
        if (user) return badRequest(res, 'user already exists with this email');
        bcrypt.genSalt(10, (err, salt) => {
            if (err) return serverError(res);
            bcrypt.hash(password, salt, (err, hash) => {
                if (err) return serverError(res);
                new usersModels({
                    email,
                    password: hash,
                    role: 'user'
                }).save().then(user => {
                    new profilesModel({
                        userId: user._id,
                        role: user.role
                    }).save((err, result) => {
                        if (err) {
                            user.remove(err => {
                                if (err) {
                                    console.log(err);
                                }
                            });
                            return serverError(res);
                        }
                        return res.end();
                    });
                }).catch(err => {
                    console.log('error while registering user', err);
                    return serverError(res);
                })
            })
        })
    })
}


export const getUserDetails = (req, res) => {
    const { user: { id } } = req;
    profilesModel.findOne({ userId: id }).then(result => {
        if (!result) return badRequest(res, 'user not found');
        return res.json(result);
    }).catch(err => {
        console.log(err);
        return serverError(res)
    })
}