# skyrooms
Real time chat application with users and rooms. Node and Express on the back end, vanilla JavaScript on the front end, socket.io is used for real time, bidirectional communcation between the client and the server. jQuery used to query the DOM and of course HTML and CSS for the markup and styling. This is my second application and an upgrade on my first, Skynet Chat.

Features:

1) Rooms: Multiple rooms can be open at once. Users can communicate with other users in the same room as them.

2) User display: Sidebar where the list of users in your room are displayed. The sidebar is dynamically updated each time a user joins and
   leaves the room.

3) Colours for sender vs receiver: All messages you send are in blue, all messages you receive are in grey. This goes for all other clients 
   using the application.

4) User typing: Lets you know when another user in your room is typing a message.

5) Welcome, join, leave: Skyroom gives you a welcome message when you join a room, it lets all the other users know when you join the room
   and it lets all other users know when you leave the room. Of course, this is across the board for all clients.

6) Room display: Under the header bar, there's a bar which always lets you know what room you are in.

7) Leave room button: Button you can press which exits you out of the room you are in.

8) Timestamp: Every message has a small display of the time it was sent in the bottom right corner of the message bubble.

9) Responsive: Use of CSS Flexbox makes the application responsive in the browser.

10) Most recent message: Like any chat application out there, the scrollbar follows the most recent message.
