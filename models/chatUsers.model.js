import { Schema, model } from 'mongoose';

const chatUsers = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        required: true,
        index: true,
        unique: true
    },
    users: [{
        user: {
            type: Schema.Types.ObjectId,
            required: true
        },
        conversationId: {
            type: String,
            required: true
        }
    }]
});

export default model('chat_users', chatUsers);