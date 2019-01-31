const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const mongoose = require('mongoose');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');

const app = express();

const PORT = 3000;

//Require ./passport/index.js and pass in the passport const
require('./passport')(passport);

const db = require('./db/config.js').mongoUri;

mongoose.connect(db, {
        useNewUrlParser: true
    })
    .then(() => console.log('Mongo works :)'))
    .catch(err => console.log(err));

// EJS
app.use(expressLayouts);
app.set('view engine', 'ejs');

app.use(express.urlencoded({
    extended: false
}));

app.use(session({
    secret: 'supersecretpasswordbro', // This should not be here
    resave: true,
    saveUninitialized: true
}))

// Passport middleware - never before express-session
app.use(passport.initialize());
app.use(passport.session());

// Send alerts with connect-flash
app.use(flash());

// Global vars so success_msg and error_msg can be included in all views
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();
})

app.use('/', require('./routes'));

app.listen(PORT, console.log(`Click me http://localhost:${PORT}`));