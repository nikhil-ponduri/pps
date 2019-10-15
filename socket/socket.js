import jwt from 'jsonwebtoken';
import { SECRETKEY } from '../utils/constants';
// const io = require('socket.io')(3000);

let io;

module.exports = (io1) => {
    io = io1;
    io.use((socket, next) => {
        let token = socket.handshake.query.token;
        token = token ? token.split(' ')[1] : 1;
        jwt.verify(token, SECRETKEY, (err, user) => {
            if (err) return next(new Error('not authorized'));
            socket.userId = user.id;
            return next();
        })
    })
    io.on('connection', (socket) => {
        socket.join(socket.userId);
    });
}

export const sendMessage = (id, message) => {
    io.to(id).emit('message', message);
}
