module.exports = {
    ensureLoggedIn: function (req, res, next) {
        if (req.isAuthenticated()) {
            return next();
        }
        req.flash('error_msg', 'Looking for something?');
        res.redirect('/login');
    }
}