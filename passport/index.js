const LocalStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('../models/User');

module.exports = function (passport) {
    passport.use(
        new LocalStrategy((username, password, done) => {
            // Here we check if there is a matching document in our db
            User.findOne({
                    username
                })
                .then(user => {
                    if (!user) {
                        return done(null, false, {
                            message: "Login error"
                        }); // Same error everywhere so hack artists don't know what's going on
                    }

                    // Compare the provided password with our db stored hash password
                    bcrypt.compare(password, user.password, (err, success) => {
                        if (err) throw err;
                        if (success) {
                            // The password matches with the hash
                            return done(null, user);
                        } else {
                            return done(null, false, {
                                message: "Login error"
                            }); // Same error everywhere so hack artists don't know what's going on

                        }
                    });
                })
                .catch(err => console.log(err))
        })
    );

    passport.serializeUser((user, done) => {
        done(null, user.id);
    });
    passport.deserializeUser((id, done) => {
        User.findById(id, (err, user) => {
            done(err, user);
        });
    });
}