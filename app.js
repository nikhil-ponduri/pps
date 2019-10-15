import http from 'http';
import passport from 'passport'
import fileUpload from 'express-fileupload';
import logger from 'morgan';
import express from 'express';
import cors from 'cors';
const app = express();
const server = http.createServer(app);
const path = require('path');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const io = require('socket.io')(server);

app.use(cors());
app.use(logger('dev'))
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(fileUpload())
app.use(express.static(path.join(__dirname, 'public')));
app.use(passport.initialize());
require('./auth/passport')(passport)

mongoose.connect('localhost://mongodb/test', { useNewUrlParser: true }).catch(err => {
  console.log('connection error', err);
});

//server static

app.use(express.static('build'))


//validate a socket
require('./socket/socket')(io)

// routing

app.use('/api/user', require('./routes/user.router'));
app.use('/api/products', require('./routes/products.router'));
app.use('/api/admin', require('./routes/admin.router'));
app.use('/api/cart', require('./routes/cart.router'));

app.use('/*', (req, res) => {
  res.sendFile(__dirname + '/build/index.html');
})


// catch 404 and forward to error handler
app.use(function (req, res, next) {
  res.status(404).json()
});

process.on('uncaughtException', (err) => {
  console.log(err)
})

// error handler

server.listen(4000);
