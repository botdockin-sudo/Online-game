const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const path = require('path');

app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', (socket) => {
    socket.on('join-room', (roomId) => {
        const room = io.sockets.adapter.rooms.get(roomId);
        const users = room ? room.size : 0;

        if (users < 2) {
            socket.join(roomId);
            const role = users === 0 ? 'p1' : 'p2';
            socket.emit('player-assigned', { role, roomId });
            if (users === 1) io.to(roomId).emit('start-game');
        } else {
            socket.emit('error-msg', 'Room Full');
        }
    });

    socket.on('move', (data) => {
        socket.to(data.roomId).emit('receive-move', data);
    });

    socket.on('signal', (data) => {
        socket.to(data.roomId).emit('signal', data);
    });
});

http.listen(3000, () => console.log('Server on http://localhost:3000'));
