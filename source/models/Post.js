const mongoose = require('mongoose');

let postSchema = new mongoose.Schema({
    author: { type: mongoose.SchemaTypes.ObjectId, ref: 'User' },
    img: { type: mongoose.SchemaTypes.String },
    text: { type: mongoose.SchemaTypes.String },
    date: { type: mongoose.SchemaTypes.Date, default: '' },
    usersLikes: [{ type: mongoose.SchemaTypes.ObjectId, ref: 'User', default: [] }],
    likes: { type: mongoose.SchemaTypes.Number, default: 0 }
});

const Post = mongoose.model('Post', postSchema);

module.exports = Post;