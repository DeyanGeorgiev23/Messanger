const User = require('../models/User');
const Chat = require('../models/Chat');
const Message = require('../models/Message');

module.exports = {
    friends: {
        findGet: (req, res) => {
            let currentUser = req.user.id;
            User.find()
                .then(users => {
                    User.findById(currentUser)
                        .populate('friends')
                        .then(user => {
                            if (user.friends) {
                                let userFriends = [];
                                user.friends.forEach(f =>  userFriends.push(f.id));
    
                                let usersData = users.filter(u => u.id !== user.id && u.roles[0] !== 'Admin');
                                for (let friend of userFriends) {
                                    usersData = usersData.filter(u => u.id !== friend);
                                }

                                return res.render('users/friends/find', { usersData });
                            } else {
                                let usersData = users.filter(u => u.id !== user.id && u.roles[0] !== 'Admin');
                                res.render('users/friends/find', { usersData });
                            }
                        });
                }).catch(err => {
                    throw Error(err);
                });
        },  
        findPost: (req, res) => {
            let currentUser = req.user._id;
            let otherUserId = req.body.Id;

            User.findById(otherUserId)
                .then(user => {
                    user.request.push(currentUser);
                    user.save().then(() => {
                        res.redirect('/');
                    });
                }).catch(err => {
                    throw Error(err);
                });
        },
        requestGet: (req, res) => {
            let userId = req.user.id;

            User.findById(userId)
                .populate('request')
                .then(user => {
                    let users = user.request;
                    res.render('users/friends/request', { users });
                }).catch(err => {
                    console.log(err);
                });
        },
        requestPost: (req, res) => {
            let currentUser = req.user.id;
            let otherUser = req.body.Id;

            if (req.body.accept) {
                User.findById(currentUser)
                    .then(user => {
                        user.request = Array.from(user.request).filter(r => r.toString() !== otherUser);
                        user.friends.push(otherUser);
                        user.save().then(() => {
                            User.findById(otherUser).then(u => {
                                u.friends.push(currentUser);
                                u.save().then(() => {
                                    Chat.findOne({ users: { $all: [ currentUser, otherUser ]}})
                                        .then(currentChat => {
                                            if (!currentChat) {
                                                let newChat = {
                                                    users: [ currentUser, otherUser ]
                                                };
                                                Chat.create(newChat)
                                                    .then(() => {
                                                        return res.redirect('/');
                                                    }).catch(err => {
                                                        throw Error(err);
                                                    });
                                                return;
                                            }
                                            res.redirect('/');
                                        }).catch(err => {
                                            throw Error(err);
                                        });
                                });
                            });
                        });
                    }).catch(err => {
                        throw Error(err);
                    });
            } else {
                User.findById(currentUser)
                    .then(user => {
                        user.request = Array.from(user.request).filter(r => r.toString() !== otherUser);
                        user.save().then(() => {
                            let users = user.request;
                            res.render('users/friends/request', { users });
                        });
                    }).catch(err => {
                        throw Error(err);
                    });
            }
        },
        listGet: (req, res) => {
            let UserID = req.user.id;

            User.findById(UserID)
                .populate('friends')
                .then(user => {
                    let users = user.friends.filter(u => u !== null);
                    res.render('users/friends/list', { users });
                });
        }
    },
    chat: {
        getChat: (req, res) => {
            let currentUser = req.user.id;
            let userToChat = req.params.id;

            Chat.findOne({users: { $all: [ currentUser, userToChat ]}})
                .then(chat => {
                    let chatId = chat.id;
                    Message.findOne({ chat: chatId })
                        .then(existingChat => {
                            if (!existingChat) {
                                Message.create({
                                    chat: chatId,
                                    authorID: currentUser
                                }).then(() => {
                                    User.findById(userToChat)
                                        .then(user => {
                                            let picture = user.profileImg;
                                            let firstName = user.firstName;
                                            let lastName = user.lastName;
                                            res.render('chat/chatroom', { picture ,firstName, lastName, chatId, userToChat });
                                        }).catch(err => {
                                            throw new Error(err);
                                        });
                                });
                                return;    
                            }
                            User.findById(userToChat)
                                .then(user => {
                                    // console.log(existingChat.content.isCurrentUserMessage);
                                    res.render('chat/chatroom', {
                                        text: existingChat.content,
                                        picture: user.profileImg,
                                        firstName: user.lastName, 
                                        lastName: user.firstName, 
                                        chatId: chatId,
                                        isCurrentUserMessage: existingChat.content.isCurrentUserMessage,
                                        userToChat: userToChat 
                                    });
                                }).catch(err => {
                                    throw new Error(err);
                                });
                        }).catch(err => {
                            throw new Error(err);
                        });
                }).catch(err => {
                    throw new Error(err);
                });
        },
        postChat: (req, res) => {
            let chatId = req.body.chatId;
            let userToChat = req.body.userToChat;
            if (req.body.message) {
                Message.findOne({ chat: chatId})
                    .then(message => {
                        message.content = req.body.message;
                        for (let msg of message.content) {
                            msg.isCurrentUserMessage = (message.authorID == req.user.id);
                            console.log(msg.isCurrentUserMessage);
                        }
                        message.save()
                            .then(() => {
                                res.redirect(`/users/friends/chat/${userToChat}`);
                            });
                    }).catch(err => {
                        throw Error(err);
                    });
            }
        }
    }
};