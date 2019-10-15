import passport from 'passport';
import aws from 'aws-sdk';

aws.config.update({
    accessKeyId: '',
    secretAccessKey: ''
})

export const getConversationId = (id1, id2) => {
    if (!id1 || !id2) return;
    return id1 > id2 ? id2 : id1
}

export const sendResponse = (res, data) => {
    return res.json(data);
}

export const S3 = new aws.S3();
