const express = require('express');

const socket = require('socket.io');

const app = express();

const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
  console.log(`Listening on port ${port}...`);
});

app.use(express.static('public'));

const io = socket(server);

let users = {};

function getUsersInRoom(users, room) {
  let roomUsers = [];
  Object.values(users).forEach(user => {
    if (user.room === room) {roomUsers.push(user.name);}
  });
  return roomUsers;
}

io.on('connect', socket => {
  
  socket.on('new user', data => {

    users[socket.id] = {
      name: data.userName,
      room: data.room
    }

    socket.join(data.room);
    
    socket.broadcast.to(data.room).emit('user joined', users[socket.id]);

    io.to(data.room).emit('output users', getUsersInRoom(users, data.room));
  });

  socket.on('user typing', data => {
    socket.broadcast.in(data.room).emit('user typing', data.userName);
  });

  socket.on('user message', data => {
    io.in(data.room).emit('user message', data);
  });

  socket.on('disconnect', () => {
    if (Object.keys(users).includes(socket.id)) {
      const userWhoLeft = users[socket.id].name;
      const roomLeft = users[socket.id].room;
      delete users[socket.id];
      const roomUsers = getUsersInRoom(users, roomLeft);
      socket.broadcast.to(roomLeft).emit('user left', {
        userWhoLeft,
        roomUsers
      });
    }
  });
  
});
