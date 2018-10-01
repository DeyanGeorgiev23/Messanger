const controllers = require('../controllers');
const permissions = require('./permissions');
const multer = require('multer');

let upload = multer({ dest: './public/img'});

module.exports = (app) => {
    app.get("/", controllers.home.get);

    app.get('/users/register', controllers.user.register.get);
    app.post('/users/register', controllers.user.register.post);

    app.get('/users/login', controllers.user.login.get);
    app.post('/users/login', controllers.user.login.post);

    app.post('/users/logout', controllers.user.logout);
    
    app.get('/users/find', permissions.hasUserAccess, controllers.home.find.findUser);

    app.post('/users/profile/remove', permissions.hasUserAccess, controllers.user.profile.remove);

    app.post('/users/profile/info', permissions.hasUserAccess, controllers.user.profile.settingsPost);

    app.get('/users/profile/:id', permissions.hasUserAccess, controllers.user.profile.get);
    app.post('/users/profile/:id', permissions.hasUserAccess, upload.fields([{ name: 'profileImage', maxCount: 1 },{ name: 'backGroundImage', maxCount: 1 }]), controllers.user.profile.post);

    app.post('/users/create/like', permissions.hasUserAccess, controllers.user.posts.likePost);

    app.post('/users/create/post', permissions.hasUserAccess, upload.single('img'), controllers.user.posts.createPost);
    
    app.get('/users/friends/find', permissions.hasUserAccess, controllers.friends.friends.findGet);
    app.post('/users/friends/find', permissions.hasUserAccess, controllers.friends.friends.findPost);

    app.get('/users/friends/request', permissions.hasUserAccess, controllers.friends.friends.requestGet);
    app.post('/users/friends/request', permissions.hasUserAccess, controllers.friends.friends.requestPost);

    app.get('/users/friends/list', permissions.hasUserAccess, controllers.friends.friends.listGet);

    app.get('/users/friends/chat/:id', permissions.hasUserAccess, controllers.friends.chat.getChat);
    app.post('/users/friends/chat/:id', permissions.hasUserAccess, controllers.friends.chat.postChat);
};