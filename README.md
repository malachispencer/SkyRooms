# SkyRooms
Real time chat application with users and rooms. Node and Express on the back end, vanilla JavaScript on the front end, socket.io is used for real time, bidirectional communication between the client and the server. jQuery used to query the DOM and HTML and CSS used for the markup and styling. This is my second application and an upgrade on my first, Skynet Chat.

![skyroomshome](https://user-images.githubusercontent.com/71923215/95295292-14eae180-0877-11eb-862e-6f63147235f3.jpg)

## Usage

```shell
npm install
npm run dev
localhost:port
```

## Features

1) Rooms: Multiple rooms can be open at once. Users can communicate with other users in the same room as them.

2) User display: Sidebar where the list of users in your room are displayed. The sidebar is dynamically updated each time a user joins and
   leaves the room.

3) Colours for sender vs receiver: All messages you send are in blue, all messages you receive are in grey.

4) User typing: Lets all users know when another user in their room is typing a message.

![skyroomsmsgs](https://user-images.githubusercontent.com/71923215/95295909-2aacd680-0878-11eb-8773-e20a43496acb.jpg)

5) Welcome and join: SkyRoom gives you a welcome message when you join a room and it lets all the other users know you have joined the room.
   
![skyroomsjoin](https://user-images.githubusercontent.com/71923215/95295409-4d8abb00-0877-11eb-8af5-10c3e139b52b.jpg)
   
6) Leave: SkyRoom lets all other users know when a user leave the room.
   
![skyroomsleave](https://user-images.githubusercontent.com/71923215/95295535-8cb90c00-0877-11eb-8c4d-b712498292e5.jpg)
   
7) Room display: Under the header bar, there's a bar which always lets you know what room you are in.

8) Leave room button: Button you can press which exits you out of the room you are in.

9) Timestamp: Every message has a small display of the time it was sent in the bottom right corner of the message bubble.

10) Responsive: Use of CSS Flexbox makes the application responsive in the browser.

11) Most recent message: Like any chat application out there, the scrollbar follows the most recent message.
