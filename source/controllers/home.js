const User = require('../models/User');
const Post = require('../models/Post');

module.exports = {
    get: (req, res) => {
        if (req.user) {
            User.findById(req.user._id)
                .populate('friends')
                .then(usr => {
                    User.find()
                        .then(users => {
                            Post.find()
                                .where('author').equals(users)
                                .populate('author')
                                .then(existPost => {
                                    let post = existPost;
                        
                                    let userFr = {
                                        profileImage: usr.profileImage,
                                        firstName: usr.firstName,
                                        lastName: usr.lastName,
                                        friends: usr.friends,
                                    };

                                    res.render('home/index', { userFr, post });
                                });
                        }).catch(err => {
                            throw Error(err);
                        });
                }).catch(err => {
                    console.log(err);
                });

            return;
        }

        res.render('home/index');
    }, 
    find: {
        findUser: (req, res) => {
            let userName = req.query.text;
            let currentUser = req.user.id;

            User.find()
                .then(users => {
                    User.findById(currentUser)
                        .then(user => {
                            let notFriends = users.filter(u => u.firstName.toLowerCase().includes(userName.toLowerCase()) && u.id !== req.user.id);
                            notFriends = notFriends.filter((u, i) => u.id !== Array.from(user.friends.toString().split(','))[i]);                    
                            res.render('users/find', { notFriends });
                        });
                }).catch(err => {
                    throw Error(err);
                });
        }
    },
};