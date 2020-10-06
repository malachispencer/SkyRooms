// Our server will use the Express framework so we require the Express module, which returns a function.

const express = require('express');

// We require the socket.io module on the server side.

const socket = require('socket.io');

// We call the express function, which returns an object holding all the express methods like get(), listen() etc.
// By convention, we store the express object in a constant called app.

const app = express();

// Typically, in hosting environments for Node apps, we have an environment variable called PORT.
// To read the value of PORT, we access the process global object, which has a property called env.
// What we do here allows our port to be dynamically assigned by the hosting environment, because 3000 may not be available.
// If no PORT is set in the hosting environment, we use 3000 as the port.

const port = process.env.PORT || 3000;

// Here we create our server, listening for requests on the port, we store our server in the variable server.

const server = app.listen(port, () => {
  console.log(`Listening on port ${port}...`);
});

// We serve the files in the public folder to the browser, without this we'd get a page simply displaying 'Cannot GET /'.

app.use(express.static('public'));

// The socket.io module that we required above was a function, it takes a parameter, namely, the server we want to work with.
// Now - as long as socket is also set up on the front end - socket can listen for connections from a client, which we do below.

const io = socket(server);

// We initialize an empty object where we will store our users.
// Each user is stored in the format socket.id: {name, room}.
// Because socket ids are unique, our format makes it super easy to find a user even if another in another room has the same username.
// Each time a new user enters a room, we put that user in the object.
// Each time a user leaves a room, we delete that user from the object.

let users = {};

// This function gets all the users in a given room.
// It returns an array of the usernames of the users in the given room.
// We invoke it here on the server when a new user joins a room, and when a user leaves a room, after that user has been deleted from users.
// It allows us to keep the users-online section of our sidebar - on the client - updated with the users currently in the room.

function getUsersInRoom(users, room) {
  let roomUsers = [];
  Object.values(users).forEach(user => {
    if (user.room === room) {roomUsers.push(user.name);}
  });
  return roomUsers;
}

// Whenever a socket connects to the server, this event listener fires and allows all the code inside of it to execute.

io.on('connect', socket => {

  // When a new user joins, the client sends their username and room name.
  // We add this client's socket id, username and room name to our users object initialized above.
  // We make the client - which socket identifies by its unique socket id - join the room it chose to join.
  // socket.broadcast.emit() allows us to emit an event to all clients apart from the client who initiated the client-server communication.
  // We send a 'user joined' event to all clients but the new user, with the new user's name and room, taken from the users object.
  // io.emit() emits to all clients, including the client which initiated the client-server communication.
  // We send an 'output users' event to all clients, sending an array of all the users (by name) in the room of the new user.
  
  socket.on('new user', data => {

    users[socket.id] = {
      name: data.userName,
      room: data.room
    }

    socket.join(data.room);
    
    socket.broadcast.to(data.room).emit('user joined', users[socket.id]);

    io.to(data.room).emit('output users', getUsersInRoom(users, data.room));
  });

  // We listen for a 'user typing' event from a client.
  // When we receive one, to all the other clients in that client's room, we send a 'user typing' event.
  // We also send the userName of the client that was typing i.e. the client that originally sent us a 'user typing' event.

  socket.on('user typing', data => {
    socket.broadcast.in(data.room).emit('user typing', data.userName);
  });

  // Here we listen for the 'user message' event sent from a client, which is sent during a message submit event on the front end.
  // We take the data that was sent over and emit that data to all clients in the room of the initiating client.
  
  socket.on('user message', data => {
    io.in(data.room).emit('user message', data);
  });

  // This event listener fires when a socket disconnects from the server, this occurs when the page is closed or refreshed.
  // Every time index.html opens, a socket connects to the server. So the connected socket need not be connected to a user.
  // We only perform the actions inside our event listener if the socket is in our users object i.e. connected to a user.
  // If we didn't, our app would crash when users is empty, because we are trying to get properties of an empty object.
  // We take the name and room of the leaving user, we delete that user from users, then we get all the users in their room.
  // We emit a 'user left' event to all the users in the leaving user's room, other than the leaving user of course.

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