const mongoose = require('mongoose');

let chatSchema = mongoose.Schema({
    users: [{ type: mongoose.SchemaTypes.ObjectId, required: true }],
    messages: [{ type: mongoose.SchemaTypes.ObjectId, ref: 'Message' }],
    dataCreated: { type: mongoose.SchemaTypes.Date, default: Date.now }
});

let Chat = mongoose.model('Chat', chatSchema);

module.exports = Chat;