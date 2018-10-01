const homeController = require('./home');
const userController = require('./user');
const friendsController = require('./friends');

module.exports = {
    user: userController,
    home: homeController,
    friends: friendsController
};