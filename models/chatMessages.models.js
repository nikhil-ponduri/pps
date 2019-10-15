import { model, Schema } from 'mongoose';

const chatSchema = new Schema({
    conversationId: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now()
    },
    from: {
        required: true,
        type: Schema.Types.ObjectId
    },
    to: {
        required: true,
        type: Schema.Types.ObjectId
    }
});

chatSchema.index({ conversation: 1, date: -1, from: 1 });

export default model('chat_schema', chatSchema);