import { Storage } from '@google-cloud/storage';
export const SECRETKEY = 'Nikhilndi%$#b^&dljdnvionvscalsv@sf#s#@'
export const INTERNAL_SERVER = 'Internal server error plese try again after some time';

export const serverError = (res, message, err) => {
    console.log(err);
    return res.status(500).json({
        message: message ? message : INTERNAL_SERVER
    });
}

export const badRequest = (res, message) => {
    return res.status(400).json({ message });
}

export const storage = new Storage({
    projectId: 'projectpps',
    keyFilename: './gcloud.json'
});

export const bucket = storage.bucket('nikhil_bucket');