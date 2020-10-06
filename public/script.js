// Along with the URL in the script tag inside index.html, this loads socket on the client side.

const socket = io();

// We use the jQuery ready method to fire our front end javascript only once the DOM has fully loaded.

$(document).ready(function() {

  // On the client, we initialize a userName and room variable, which will be sent to the server via socket.

  let userName = '';
  let room = ''

  // The user fills out the form when the page opens, which requires a username and a room name.
  // When the user submits the form, we grab their inputs and assign their values to userName and room respectively.
  // Once we have a userName and room, we hide the home image and home form container.
  // Using the jQuery append method, we dynamically insert the room name into the room banner, then we display the room banner.
  // We also display the chat container, which includes the sidebar container and the message container.
  // We then send the userName and room name to the server using socket.
  // Finally, we call the welcomeToSkyRooms function.

  $('#home-form').submit(event => {
    event.preventDefault();
    userName = $('#name')[0].value.trim();
    room = $('#room')[0].value.trim();

    if (userName && room) {
      $('#home-image').css('display', 'none');
      $('#home-form-container').css('display', 'none');
      $('#room-container').append(`<h3>You are in the room: ${room}</h3>`);
      $('#room-container').css('display','flex');
      $('#chat-container').css('display', 'flex');
    }

    socket.emit('new user', {
      userName,
      room
    });

    welcomeToSkyRooms();
  });

  // This function outputs a welcome message that will appear only on the screen of the client who just joined a room.
  // It also displays the chat form container, which holds the form where users can type and submit messages.

  function welcomeToSkyRooms() {
    const welcomeMsg = `Hello ${userName}, welcome to SkyRooms, you are in the ${room} room.`
    const msgHeader = '<h4 class="msg-header">SkyRoom:</h4>';
    const welcomeMsgElement = `<p class="msg-element">${welcomeMsg}<br><span class="timestamp">${currentTime()}</span></p>`;
    const msgWrapped = $('<div class="message"></div>').append(msgHeader).append(welcomeMsgElement);
    $('#messages-container').append(msgWrapped);
    $('#chat-form-container').css('display', 'flex');
  }

  // We listen for the 'user joined' event sent from the server.
  // This fires for all clients in the room of the user who just joined, other than that user who just joined.
  // The clients are notified that a new user has entered the chat.
  // We call the scrollToBottom function, which keeps our chat following the most recent message.

  socket.on('user joined', user => {
    const newUserMsg = `${user.name} has entered the chat.`
    const msgHeader = '<h4 class="msg-header">SkyRoom:</h4>'
    const newUserMsgElement = `<p class="msg-element">${newUserMsg}<br><span class="timestamp">${currentTime()}</span></p>`;
    const msgWrapped = $('<div class="message"></div>').append(msgHeader).append(newUserMsgElement);
    $('#messages-container').append(msgWrapped);
    scrollToBottom();
  });

  // Here we listen for the 'output users' event sent from the server.
  // This fires for all clients in the room, when a user joins the room.
  // It calls our outputUsers function, passing in the array of all users (by name) currently in the room, which was sent from the server.

  socket.on('output users', usersInRoom => {
    outputUsers(usersInRoom);
  });

  // This function is invoked every time a user joins the room, and every time a user leaves the room.
  // It starts by clearing the users-online div in the HTML, using the jQuery empty() method.
  // The array of users (by username) that it takes in, is iterated over using forEach(), and each user is appended to users-online.
  // Thus all the users in the room are added to the users-online section of the sidebar.

  function outputUsers(users) {
    $('#users-online').empty();
    users.forEach(user => {
      $('#users-online').append(`<div class="user">${user}</div>`);
    });
  }
  
  // When the client is typing a message, we listen for a keydown event using the jQuery keydown() method.
  // When it is detected that the client has pressed down on a key, we emit to the server a 'user typing' event.
  // We send the userName and room of the typing client to the servrer.

  $('#user-message').keydown(() => {
    socket.emit('user typing', {
      userName,
      room
    });
  });

  // Here we listen for a 'user typing' event sent from the server.
  // This fires for all clients in the room, apart from the client that initiated the client-server back and forth.
  // To the messages container, we append the user-typing div. We append the already made div, we don't create a new one.
  // The above means we avoid duplicating 'x is typing a message' as many times as a key is pressed down.
  // It also means 'x is typing a message...' always appears below all the previous messages.
  // The append method makes the appended element the last child of the parent.
  // The jQuery html() method is the equivalent of the JavaScript innerHTML() method.
  // We place inside the user-typing div that the client who started this client-server back and forth is typing.
  // We scroll to bottom to keep the chat displaying who is currently typing.

  socket.on('user typing', user => {
    $('#messages-container').append($('#user-typing'));
    $('#user-typing').html(`<em>${user} is typing a message...</em>`);
    scrollToBottom();
  });

  // Here we listen for when the user submits a message.
  // We send to the server the time posted, the message, the username of the client, the room the client is in and their socket ID.
  // We clear the user message text form.

  $('#chat-form').submit(event => {
    event.preventDefault();
    const timePosted = currentTime();
    const userMsg = $('#user-message')[0].value.trim();
    const senderID = socket.id;

    socket.emit('user message', {
      timePosted,
      userMsg,
      userName,
      room,
      senderID
    });

    $('#user-message')[0].value = '';
  });

  // Here we listen for the 'user message' event coming from the server,
  // We first clear the text from the user-typing div.
  // We then dynamically set the class for message header and message element.
  // If the client is the initiating client, class is sender-msg-header, otherwise it is msg-header.
  // This allows us to make an individual client's messages blue, and all other (i.e. received) messages are grey.
  // We display the initiating client's message to the chat and then scroll to bottom.

  socket.on('user message', data => {
    $('#user-typing').html('');

    const msgHeaderClass = socket.id === data.senderID ? "sender-msg-header" : "msg-header";
    const msgElementClass = socket.id === data.senderID ? "sender-msg-element" : "msg-element";

    const userMsg = data.userMsg;
    const msgHeader = `<h4 class=${msgHeaderClass}>${data.userName}:</h4>`;
    const msgElement = `<p class=${msgElementClass}>${userMsg}<br><span class="timestamp">${data.timePosted}</span></p>`;
    const msgWrapped = $('<div class="message"></div>').append(msgHeader).append(msgElement);
    $('#messages-container').append(msgWrapped);
    scrollToBottom();
  });

  // Here we listen for a 'user left' event from the server.
  // When we receive it, we first clear the user-typing div.
  // We post to all remaining clients that x-user has left the chat.
  // We scroll to bottom and call the outputUsers function so the users sidebar is updated.

  socket.on('user left', data => {
    $('#user-typing').html('');
    const leaveMsg = `${data.userWhoLeft} has left the chat.`
    const msgHeader = '<h4 class="msg-header">SkyRoom:</h4>';
    const msgElement = `<p class="msg-element">${leaveMsg}<br><span class="timestamp">${currentTime()}</span></p>`;
    const msgWrapped = $('<div class="message"></div>').append(msgHeader).append(msgElement);
    $('#messages-container').append(msgWrapped);
    scrollToBottom();
    outputUsers(data.roomUsers);
  });

  // This event listener listens for a click event on our leave room button.
  // When it receives a click, we are sent to index.html and the session history is deleted.
  // The session history deletion means the user cannot press the back button to get the previous screen.
  // The action taken makes the socket disconnect, triggering our disconnect event on the server.

  $('#leave-room-button').click(() => {
    window.location.replace('index.html');
  });

  // This function parses a date object and generates the current time in 24-hour format.
  // It is invoked whenever a message is posted to the chat, whether from SkyRooms or from a client.

  function currentTime() {
    const date = new Date();
    const hours = (date.getHours() < 10 ? '0' : '') + date.getHours();
    const minutes = (date.getMinutes() < 10 ? '0' : '') + date.getMinutes();
    return `${hours}:${minutes}`;
  }

  // This function keeps our message container displaying the most recent message as it is posted.
  // When passed in a parameter, scrollTop() allows us set the vertical position of the scroll bar for the message container.
  // The position is a value in pixels.
  // We pass in the largest integer JavaScript can handle without using BigInt (9007199254740991).
  // The use of this number reasonably ensures that the scroll bar always goes to the bottom when a message is posted.

  function scrollToBottom() {
    const bottom = 9007199254740991;
    $('#messages-container').scrollTop(bottom);
  }
  
});