import { model, Schema } from 'mongoose';

const trashSchema = new Schema({
    images: [String],
    created: {
        type: Date,
        required: true
    },
    deleted: {
        type: Date,
        default: Date.now()
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'users',
        required: true,
        index: true
    }
});

export default model('trash', trashSchema);