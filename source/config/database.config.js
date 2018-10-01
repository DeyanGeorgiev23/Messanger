const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const User = require('../models/User');
const encryption = require('../utilities/encryption');

function seedAdmin() {
    User.find({}).then(users => {
        if (users.length > 0) return;
        
        let salt = encryption.generateSalt();
        let hashedPass = encryption.generateHashedPassword(salt, '123456');
        
        User.create({
            email: 'admin@gmail.com',
            firstName: 'Deyan',
            lastName: 'Georgiev',
            salt: salt,
            password: hashedPass,
            roles: ['Admin']
        });
    });
}


module.exports = (config) => {
    mongoose.connect(config.connectionString);

    let database = mongoose.connection;
    database.once('open', (err) => {
        if (err) {
            console.log(err);
            return;
        }

        console.log('Connected!');
    });

    database.on('error', (err) => {
        console.log(err);
    });

    seedAdmin();
};

