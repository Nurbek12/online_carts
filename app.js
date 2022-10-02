const express = require('express');
const app = express();
const server = require('http').createServer(app);
const { Server } = require('socket.io');
const path = require('path');
const io = new Server(server);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');

app.get('/', (_, res) => {
    res.render('game');
});

require('./Socket')(io)

server.listen(process.env.PORT || 5000, () => {
    console.log('Server start...');
});