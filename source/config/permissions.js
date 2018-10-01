const User = require('../models/User');

module.exports = {
    hasUserAccess: (req, res, next) => {
        if (req.isAuthenticated()) {
            next();
        } else {
            res.redirect('/users/login');
        }
    },
    hasAccess: (role) => {
        return (req, res, next) => {
            if (req.user && req.user.roles.indexOf(role) !== -1) {
                next();
            } else {
                res.redirect('/users/login');
            }
        };
    },
    isNotBlocked: (req, res, next) => {
        let otherUser = req.params.email;

        User.findOne({ email: otherUser }).then(otherUser => {
            if (otherUser.blockedUsers.indexOf(req.user._id) !== -1) {
                res.redirect(`/?error=${ otherUser.email } has blocked you, and I restritect the post method :)`);
            } else {
                next();
            }
        });
    }
};