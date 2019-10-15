import chatUsersModel from "../models/chatUsers.model";
import chatMessagesModels from "../models/chatMessages.models";
import { getConversationId } from "../utils/utils";
import { serverError } from "../utils/constants";
import usersProfilesModel from "../models/users.profiles.model";

export const sendMessage = (req, res) => {
    const { user: { id }, body: { message, to } } = req;
    chatUsersModel.updateOne({ _id: id }, { $addToSet: { users: { user: to, conversationId: getConversationId(id, to) } } }, { upsert: true }).catch(err => {
        console.log(err);
    });
    chatUsersModel.updateOne({ _id: to }, { $addToSet: { users: { user: id, conversationId: getConversationId(id, to) } } }, { upsert: true }).catch(err => {
        console.log(err);
    });
    new chatMessagesModels({
        conversationId: getConversationId(id, to),
        from: id,
        to,
        message
    }).save((err, result) => {
        if (err) return serverError(res);
        return res.json(result);
    })
}

export const getChatUsers = (req, res) => {
    const { user: { id } } = req;
    chatUsersModel.aggregate([
        { $match: { _id: id } },
        {
            $lookup: {
                from: 'chat_messages',
                pipeline: [{
                    $match: { conversationId: '$conversationId' },
                    $sort: { date: -1 },
                    $limit: 1
                }],
                as: 'recentMessage'
            }
        }
    ]).then(result => {
        return res.json(result);
    }).catch(err => {
        console.log(err);
        return serverError(res);
    })
}

export const getChatMessages = (req, res) => {
    const { user: { id }, params: { withId } } = req;
    chatMessagesModels.find({ conversationId: getConversationId(id, withId) }).sort({ date: -1 }).then(result => {
        return res.json(result);
    }).catch(err => {
        console.log(err);
        return serverError(res);
    })
}

export const searchChatusers = (req, res) => {
    const { query: { name }, user: { id } } = req;
    usersProfilesModel.aggregate([{ $match: { $text: { $search: name } } },
    { $project: { conversationId: { $cond: { if: { $gte: ['$_id', id], then: id + '$_id', else: '$_id' + id } } } } },
    { $lookup: { from: 'chat_messages', pipeline: [{ $match: { conversationId: '$conversationId' } }, { $sort: { date: -1 } }, { $limit: 1 }] }, as: 'recentMessage' }
    ]).then(result => {
        return res.json(result)
    }).catch(err => {
        console.log(err);
        return serverError(res);
    })
}