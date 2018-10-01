const User = require('../models/User');
const Post = require('../models/Post');
const encryption = require('../utilities/encryption');
const validator = require("email-validator");

module.exports = {
    register: {
        get: (req, res) => {
            res.render('users/register');
        },
        post: (req, res) => {
            let userData = req.body;

            let userEmail = userData.email;
            if(!validator.validate(userEmail)) {
                res.render('users/register', { error: 'Please enter valid email!' });
                return;
            }

            if (userData.password.length <= 6) {
                res.render('users/register', { error: 'Password must be over 6 characters!' });
                return;
            }

            if (!userData.password) {
                res.render('users/register', { error: 'Password is required!' });
                return;
            }

            if (userData.password && userData.password !== userData.confirmedPassword) {
                res.render('users/register', { error: 'Passwords do not match!' });
                return;
            }

            if (!userData.firstName) {
                res.render('users/register', { error: 'First name is required!' });
                return;
            }

            if (!userData.lastName) {
                res.render('users/register', { error: 'Last name is required!' });
                return;
            }

            let salt = encryption.generateSalt();
            userData.salt = salt;

            if (userData.password) {
                userData.password = encryption.generateHashedPassword(salt, userData.password);
            }

            userData.join = new Date();

            User.create(userData)
                .then(user => {
                    req.logIn(user, (err, user) => {
                        if (err) {
                            res.render('users/register', { error: 'Wrong credentials!' });
                            return;
                        }

                        res.redirect('/');
                    });
                }).catch(error => {
                    userData.error = error;
                    res.render('users/register', userData);
                });
        },
    },
    login: {
        get: (req, res) => {
            res.render('users/login');
        },
        post: (req, res) => {
            let reqUser = req.body;

            User.findOne({ email: reqUser.email })
                .then(user => {
                    if (!user) {
                        res.render('users/login', { error: 'Invalid credentials!' });
                        return;
                    }
        
                    if (!user.authenticate(reqUser.password)) {
                        res.render('users/login', { error: 'Invalid credentials!' });
                        return;
                    }
        
                    req.logIn(user, (err, user) => {
                        if (err) {
                            res.render('users/login', { error: err });
                        }
        
                        res.redirect('/');
                    });
                });
        },
    },
    logout: (req, res) => {
        req.logout();
        res.redirect('/');
    },
    profile: {
        get: (req, res) => {
            let currentUser = req.params.id;
            let userData = '';

            User.findById(currentUser)
                .then(user => { 
                    if (user.posts.length !== 0) {
                        Post.find()
                            .where('author').equals(user)
                            .populate('author')
                            .then(existPost => {
                                let post = existPost;

                                let userData = '';
                                if (user.about || user.town || user.school) {
                                    userData = {
                                        about: user.about, 
                                        age: user.age, 
                                        gender: user.gender, 
                                        school: user.school, 
                                        town: user.town, 
                                        relationship: user.relationship,
                                        join: user.join
                                    };
                                }

                                let userPic = '';
                                if (user.backGroundImage || user.profileImage) {
                                    userPic = {
                                        background: user.backGroundImage,
                                        profilePic: user.profileImage,
                                        firstName: user.firstName,
                                        lastName: user.lastName,
                                    }; 
                                }

                                return res.render(`users/profile`, { userPic, userData, post });
                            }).catch(err => {
                                throw Error(err);
                            });
                        return;    
                    } else if (user.backGroundImage && user.profileImage) {
                        if (user.about || user.town || user.age || user.school) { 
                            userData = {
                                about: user.about, 
                                age: user.age, 
                                gender: user.gender, 
                                school: user.school, 
                                town: user.town, 
                                relationship: user.relationship,
                                join: user.join
                            };

                            let userPic = {
                                background: user.backGroundImage,
                                profilePic: user.profileImage,
                                firstName: user.firstName,
                                lastName: user.lastName,
                            }; 
                           
                            return res.render(`users/profile`, { userPic, userData });
                        }

                        let userPic = {
                            background: user.backGroundImage,
                            profilePic: user.profileImage,
                            firstName: user.firstName,
                            lastName: user.lastName,
                        };

                        return res.render(`users/profile`, { userPic });
                    } else if (user.about || user.town || user.age || user.school) { 
                        userData = {
                            about: user.about, 
                            age: user.age, 
                            gender: user.gender, 
                            school: user.school, 
                            town: user.town, 
                            relationship: user.relationship,
                            join: user.join
                        };

                        return res.render(`users/profile`, { userData });
                    }

                    return res.render(`users/profile`);
                }).catch(err => {
                    throw Error(err);
                });
        },
        post: (req, res) => {
            let userId = req.user._id;

            if (req.files) {
                let background =  '/' + req.files.backGroundImage[0].path;
                let profilePic = '/' + req.files.profileImage[0].path;
    
                User.findById(userId)
                    .then(user => {
                        user.backGroundImage = background;
                        user.profileImage = profilePic;
                        user.save()
                            .then(() => {
                                return res.redirect('/');
                            }).catch(err => {
                                throw Error(err);
                            });
                    }).catch(err => {
                        throw Error(err);
                    });
                return;
            } else {
                res.redirect(`/`);
            }

        },
        settingsPost: (req, res) => {
            let userId = req.user._id;
            let userData = req.body;

            User.findById(userId)
                .then(user => { 
                    user.about = userData.about;
                    user.age = Number(userData.age);
                    user.gender = userData.gender;
                    user.school = userData.school;
                    user.town = userData.town;
                    user.relationship = userData.relationship,
                    user.save()
                        .then(() => {
                            return res.redirect(`/`);
                        }).catch(err => {
                            throw Error(err);
                        });
                }).catch(err => {
                    throw Error(err);
                });
        },
        remove: (req, res) => {
            let userToRemove = req.body.Id;
            if (req.user || userToRemove) {
                User.findById(req.user.id)
                    .populate('friends')
                    .then(user => {
                        User.findById(userToRemove)
                            .populate('friends')
                            .then(usr => {
                                let UserIndex = user.friends.toString().indexOf(userToRemove);
                                let UsrIndex = usr.friends.toString().indexOf(req.user.id);

                                user.friends = user.friends.splice(UserIndex, 1);
                                usr.friends = usr.friends.splice(UsrIndex, 1);
                                user.save()
                                    .then(() => {
                                        usr.save()
                                            .then(() => {
                                                res.redirect('/');
                                            });
                                    });
                            }).catch(err => {
                                throw Error(err);
                            });
                    }).catch(err => {
                        throw Error(err);
                    });
            }
            
        }
    },
    posts:  {
        createPost: (req, res) => {
            let userData = req.body;
            let user = req.user._id;
            
            if (req.file) {
                userData.img = '/' + req.file.path;
            }

            if (req.file) {
                User.findById(user).then(curUser => {
                    let currentDate = Date.now();
                    Post.create({
                        author: user,
                        img: userData.img,
                        text: userData.aboutPicture,
                        date: currentDate.toString().split(' ').filter(d => d !== 'GMT+0300' && d !== '(EEST)').join(' ')
                    }).then((post) => { 
                        curUser.posts.push(post);
                        curUser.save()
                            .then(() => {
                                res.redirect('/');
                            });
                    }).catch(err => { 
                        throw Error(err);
                    });
                }).catch(err => { 
                    throw Error(err);
                });
                return;
            }
            
            res.redirect('/');
        },
        likePost: (req, res) => {
            Post.findById(req.body.Id)
                .populate('usersLikes')
                .then(post => {
                    post.likes += 1;
                    
                    let currentUserIsLiked = false;
                    post.usersLikes.map(u => { 
                        if (u.id === req.user.id) {
                            currentUserIsLiked = true;
                        }
                        return;
                    });
                    
                    if (currentUserIsLiked) {
                        return res.redirect('/');
                    }

                    post.usersLikes.push(req.user._id);
                    post.save()
                        .then(() => {
                            res.redirect('/');
                        });
                }).catch(err => {
                    throw Error(err);
                });
        }
    },
    block: {
        get: (req, res) => {
            let userId = req.params.userId;

            req.user.blockedUsers.push(userId);
            req.user.save();

            res.redirect('/');
        }
    },
    unblock: {
        get: (req, res) => {
            let userId = req.params.userId;

            let index = req.user.blockedUsers.indexOf(userId);
            if (index !== -1) {
                req.user.blockedUsers.splice(index, 1);
            }
            req.user.save()
                .then(() => res.redirect('/'));
        }
    }
};