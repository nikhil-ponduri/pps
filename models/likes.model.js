import { model, Schema } from 'mongoose';

const likesSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        required: true,
        index: true,
        ref: 'users'
    },
    productId: {
        type: Schema.Types.ObjectId,
        required: true,
        index: true,
        ref: 'products'
    },
    created: {
        type: Date,
        default: Date.now()
    }
});

const likesModel = model('likes', likesSchema);

export default likesModel;