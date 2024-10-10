
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.addNewUser =  (req, res, next) => {
    bcrypt.hash(req.body.password, 10)
    .then((hash) => {
        const user = new User({
            email: req.body.email,
            password: hash
        });
        user.save().then((result) => {
            res.status(201).json({
                message: 'User Created!',
                result: result
            });
        })
        .catch(err => {
            res.status(500).json({
                message: 'Invalid Credentials.'
            });
        });
    });
};

exports.userLogin = ( req, res, next) => {
    let fetchedUser;
    User.findOne({email: req.body.email}).then((user) => {
        if(!user) {
            return res.status(401).json({ message: 'Authentication failed!'});
        }
        fetchedUser = user;
        return bcrypt.compare(req.body.password, user.password);
    })
    .then(result => {
        if (!result) {
            return res.status(401).json({ message: 'Authentication failed!'});
        }

        /* If email & pwd are validated then server will return the token. */
        const token = jwt.sign({email: fetchedUser.email, userId: fetchedUser._id}, process.env.JWT_KEY, {expiresIn: '1h'});
        res.status(200).json({
            token: token,
            expiresIn: 3600,
            userId: fetchedUser._id
        });
    })
    .catch(err => {
        return res.status(401).json({ message: 'Authentication failed, please enter valid credentials.'});
    })
};