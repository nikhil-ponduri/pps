import { Schema, model } from 'mongoose';

const profileSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'users',
    },
    role: {
        type: String,
        required: true,
        enum: ['user', 'admin']
    }
});

profileSchema.index({ userId: 1, 'likes.productId': -1 });

export default model('profiles', profileSchema);