const socket = io();

$(document).ready(function() {

  let userName;
  let room;

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

  function welcomeToSkyRooms() {
    const welcomeMsg = `Hello ${userName}, welcome to SkyRooms, you are in the ${room} room.`
    const msgHeader = '<h4 class="msg-header">SkyRoom:</h4>';
    const welcomeMsgElement = `<p class="msg-element">${welcomeMsg}<br><span class="timestamp">${currentTime()}</span></p>`;
    const msgWrapped = $('<div class="message"></div>').append(msgHeader).append(welcomeMsgElement);
    $('#messages-container').append(msgWrapped);
    $('#chat-form-container').css('display', 'flex');
  }

  socket.on('user joined', user => {
    const newUserMsg = `${user.name} has entered the chat.`
    const msgHeader = '<h4 class="msg-header">SkyRoom:</h4>'
    const newUserMsgElement = `<p class="msg-element">${newUserMsg}<br><span class="timestamp">${currentTime()}</span></p>`;
    const msgWrapped = $('<div class="message"></div>').append(msgHeader).append(newUserMsgElement);
    $('#messages-container').append(msgWrapped);
    scrollToBottom();
  });

  socket.on('output users', usersInRoom => {
    outputUsers(usersInRoom);
  });

  function outputUsers(users) {
    $('#users-online').empty();
    users.forEach(user => {
      $('#users-online').append(`<div class="user">${user}</div>`);
    });
  }

  $('#user-message').keydown(() => {
    socket.emit('user typing', {
      userName,
      room
    });
  });

  socket.on('user typing', user => {
    $('#messages-container').append($('#user-typing'));
    $('#user-typing').html(`<em>${user} is typing a message...</em>`);
    scrollToBottom();
  });

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

  $('#leave-room-button').click(() => {
    window.location.replace('index.html');
  });

  function currentTime() {
    const date = new Date();
    const hours = (date.getHours() < 10 ? '0' : '') + date.getHours();
    const minutes = (date.getMinutes() < 10 ? '0' : '') + date.getMinutes();
    return `${hours}:${minutes}`;
  }

  function scrollToBottom() {
    const bottom = 9007199254740991;
    $('#messages-container').scrollTop(bottom);
  }
  
});
