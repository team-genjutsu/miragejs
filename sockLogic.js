module.exports = function (server) {
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
    socket.on('disconnect', function() {
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
            })
          }

          ele.members.splice(ele.members.indexOf(member), 1);
          if (!rooms[idx].members.length) rooms.splice(idx, 1);
        }

      })

      connections.splice(connections.indexOf(socket), 1);
      console.log(socket.id + ' left room ' + member.roomId)
      socket.disconnect();

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

    socket.on('initial', function(payload) {
      payload = JSON.parse(payload)
      let sharedRoom = rooms.filter(room => room.id === payload.roomId)[0];
      sharedRoom.members[0].signalId = payload.signal
      io.to(sharedRoom.members[0].id).emit('initialConnected', JSON.stringify(payload));
    });

    socket.on('second', function(payload) {
      payload = JSON.parse(payload);
      let sharedRoom = rooms.filter(room => room.id === payload);
      let initialClientSig = sharedRoom[0].members[0].signalId;
      let secondClientSockId = sharedRoom[0].members[1].id;
      io.to(secondClientSockId).emit('secondPart2', JSON.stringify(initialClientSig)); //remember socket.id
    });

    socket.on('third', function(payload) {
      payload = JSON.parse(payload);
      let sharedRoom = rooms.filter(room => room.id === payload.roomId);
      let secondClient = sharedRoom[0].members.filter(client => !client.signalId);
      let initialClient = sharedRoom[0].members.filter(client => client.signalId);
      secondClient[0].signalId = payload.signal;
      io.to(initialClient[0].id).emit('thirdPart2', JSON.stringify(secondClient[0].signalId));
    });

  })
}

