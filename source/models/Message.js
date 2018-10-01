const mongoose = require('mongoose');

let messageSchema = mongoose.Schema({
    content: [{ type: mongoose.SchemaTypes.String }],
    isLink: { type: mongoose.SchemaTypes.Boolean, default: false },
    hasImage: { type: mongoose.SchemaTypes.Boolean, default: false },
    chat: [{ type: mongoose.SchemaTypes.ObjectId, ref: 'Chat' }],
    authorID: { type: mongoose.SchemaTypes.ObjectId, ref: 'User' },
    isCurrentUserMessage: { type: mongoose.SchemaTypes.Boolean },
    dateCreated: { type: mongoose.SchemaTypes.Date, default: Date.now }
});

let Message = mongoose.model('Message', messageSchema);

module.exports = Message;