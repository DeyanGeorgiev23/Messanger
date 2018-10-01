const mongoose = require('mongoose');
const encryption = require('../utilities/encryption');

const userSchema = mongoose.Schema({
    email: {
        type: mongoose.SchemaTypes.String,
        required: true,
        unique: true
    },
    password: {
        type: mongoose.SchemaTypes.String,
        required: true
    },
    salt: {
        type: mongoose.SchemaTypes.String,
        required: true
    },
    firstName: {
        type: mongoose.SchemaTypes.String,
        required: true
    },
    lastName: {
        type: mongoose.SchemaTypes.String,
        required: true
    },
    town: {
        type: mongoose.SchemaTypes.String
    },
    about: {
        type: mongoose.SchemaTypes.String
    },
    school: {
        type: mongoose.SchemaTypes.String
    },
    age: {
        type: mongoose.SchemaTypes.Number,
        min: 0,
        max: 80
    },
    relationship: {
        type: mongoose.SchemaTypes.String,
        enum: {
            values: ['Single', 'In a relationship', 'Engaged', 'Married']
        }
    },
    gender: {
        type: mongoose.SchemaTypes.String,
        enum: {
            values: ['Male', 'Female']
        }
    },
    join: {
        type: mongoose.SchemaTypes.Date
    },
    posts: [{ type: mongoose.SchemaTypes.ObjectId, ref: 'Post' }],
    backGroundImage: { type: mongoose.SchemaTypes.String },
    profileImage: { type: mongoose.SchemaTypes.String },
    request: [{ type: mongoose.SchemaTypes.ObjectId, ref: 'User', default: [] }],
    friends: [{ type: mongoose.SchemaTypes.ObjectId, ref: 'User', default: [] }],
    roles: [{ type: mongoose.SchemaTypes.String }],
    otherUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', default: [] }],
    blockedUsers: [{ type: mongoose.SchemaTypes.ObjectId, ref: 'User', default: [] }],
});

userSchema.method({
    authenticate: function (password) {
        let hashedPassword = encryption.generateHashedPassword(this.salt, password);

        return hashedPassword === this.password;
    },
    hasAccess: function (role) {
        return this.roles.indexOf(role) !== -1;
    }
});

const User = mongoose.model('User', userSchema);
module.exports = User;
