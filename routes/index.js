const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
const {
    ensureLoggedIn
} = require('../passport/auth');

const User = require('../models/User');

router.get('/', (req, res) => res.render('welcome'));
router.get('/secure', ensureLoggedIn, (req, res) => res.render('secure', {
    username: req.user.username
}));

// Register requests
router.get('/register', (req, res) => res.render('register'));

router.post('/register', (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    // Fancy: const {username, password} = req.body;

    let errs = [];

    // Dummy validation
    if (!username || !password) {
        errs.push({
            message: 'Username & passwords are required'
        });
    }

    if (password.length < 6) {
        errs.push({
            message: 'Password is < 6 chars'
        });
    }

    if (errs.length > 0) {
        // Something is not oki
        res.render('register', {
            errs,
            username,
            password
        })
    } else {
        // All good
        User.findOne({
                username: username
            })
            .then(user => {
                if (user) {
                    // Username exists
                    errs.push({
                        message: 'Username is taken'
                    });
                    res.render('register', {
                        errs,
                        username,
                        password
                    });
                } else {
                    // Create new user
                    const newUser = new User({
                        username,
                        password
                    });

                    // Encrypt password for safety lol
                    bcrypt.genSalt(10, (err, salt) =>
                        bcrypt.hash(newUser.password, salt, (err, hash) => {
                            if (err) throw err;
                            newUser.password = hash;
                            // New user is ready for save
                            newUser.save()
                                .then(user => {
                                    // Everything worked 
                                    req.flash('success_msg', 'Account created');
                                    res.redirect('/login');
                                })
                                .catch(err => console.log(err));
                        }))
                }
            })
    }
});

// Login requests
router.get('/login', (req, res) => res.render('login'));

router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/secure',
        failureRedirect: '/login',
        failureFlash: true //alert
    })(req, res, next);
});

// Logout requests
router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success_msg', 'Logged out :{');
    res.redirect('/login');
})

module.exports = router;