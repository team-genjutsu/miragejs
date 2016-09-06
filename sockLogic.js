module.exports = function(server) {
  'use strict';
  const io = require('socket.io').listen(server);

  const connections = [];
  const rooms = [];

  //room constructor
  function Room(obj) {
    this.id = obj.roomId;
    this.members = [];
    this.addMember = function(member) {
      this.members.push(member)
    }
  }

  //member constructor
  function Member(socketId, roomId, initiator) {
    this.id = socketId;
    this.roomId = roomId
    this.initiator = initiator;
    this.signalId = null;
  }


  io.sockets.on('connection', function(socket) {
    connections.push(socket);
    console.log(socket.id + ' joined!')

    //disconnecting users
    socket.once('disconnect', function() {
      console.log('disconnect triggered')

      // console.log('room:  ', rooms[0])

      let member,
        room,
        otherMem;
      // index;

      rooms.forEach(function(ele, idx) {
        member = ele.members.filter(client => client.id === socket.id)[0];
        if (member) {

          if (rooms[idx].members.length > 0) {
            rooms[idx].members.forEach((el, id) => {
              io.to(el.id).emit('updateChatters', member);
              socket.disconnect();
            })
          }

          ele.members.splice(ele.members.indexOf(member), 1);
          if (!rooms[idx].members.length) rooms.splice(idx, 1);
        }

      })

      // console.log('after going through and disconnecting sockets',rooms)
      connections.splice(connections.indexOf(socket), 1);
      // console.log(socket.id + ' left room ' + member.roomId)

      // console.log('room:  ', rooms[0])
    })

    //join room logic
    socket.on('joinRoom', (payload) => {

      payload = JSON.parse(payload);
      let roomCheck = rooms.filter(room => room.id === payload);
      if (roomCheck.length > 0) {
        if (roomCheck[0].members > 1) {
          io.to(socket.id).emit('process', JSON.stringify(false));
        } else {
          io.to(socket.id).emit('process', JSON.stringify(true));
        }
      } else {
        io.to(socket.id).emit('process', JSON.stringify(true));
      }

    })

    //initiate
    socket.on('initiate', (payload) => {

      payload = JSON.parse(payload);

      let existingRoom = rooms.filter(room => room.id === payload.roomId),
        room,
        member;

      if (existingRoom.length === 0) {

        room = new Room(payload);
        member = new Member(socket.id, payload.roomId, true)
        room.addMember(member);
        rooms.push(room);

      } else if (existingRoom[0].members.length === 1) {

        member = new Member(socket.id, payload.roomId, false)
        existingRoom[0].addMember(member)
        existingRoom[0].members.forEach((ele, idx) => {
          io.to(ele.id).emit('readyConnect', JSON.stringify('both connected'));
        })
      }
      io.to(socket.id).emit('initiated', JSON.stringify(member));

    });

    //beginning of signaling
    socket.on('message', function(payload) {
      console.log(payload.data.type)

      let sharedRoom = rooms.filter(room => room.id === payload.roomID)[0];

      // not used for anything yet but maybe for chatroom fallback?
      // if (payload.who === 'all') {
      //   sharedRoom.members.forEach((ele, idx) => {
      //     io.to(ele.id).emit('message', payload.data);
      //   });
      // } else
      if (payload.who === 'other') {
        sharedRoom.members.forEach((ele, idx) => {
          if (ele.id !== socket.id) {
            io.to(ele.id).emit('message', payload.data);
          }
        });
      }

    }); //end of signaling

  })
};
