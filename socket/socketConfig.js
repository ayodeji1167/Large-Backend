const { Server } = require('socket.io');
const directMsgService = require('../src/services/directMsgService');
const chatRoomService = require('../src/services/chatRoomService');
const userService = require('../src/services/userService');
const { decryptData } = require('../src/utility/dataCrypto');
const UnAuthorizedError = require('../lib/errors/unauthenticated');
// const BadRequestError = require('../lib/errors/bad-request');

let users = [];

const registerUser = (userId, clientId) => {
  // eslint-disable-next-line no-unused-expressions
  !users.some((user) => user.userId === userId)
  && users.push({ userId, clientId });
};

const removeUser = (clientId) => {
  users = users.filter((user) => user.clientId !== clientId);
};

const getUser = (userId) => users.find((user) => user.userId === userId);

const getConversations = async (userId) => {
  const conversations = await directMsgService.getConversationsByUserId(userId);
  return conversations;
};

const getChatRooms = async (userId) => {
  const chatRooms = await chatRoomService.getRoomsByUserId(userId);
  return chatRooms;
};

const authenticate = async (client, next) => {
  try {
    if (!client.handshake.query.token) return next(new UnAuthorizedError('No Authentication token'));
    if (typeof client.handshake.query.token !== 'string') return next(new UnAuthorizedError('Supply with a token'));
    const decoded = decryptData(client.handshake.query.token);

    const user = await userService.getUserById(decoded.id);

    if (!user) {
      return next(new UnAuthorizedError('User is not authorized'));
    }

    // eslint-disable-next-line no-param-reassign
    client.data.user = user;
    return next();
  } catch (error) {
    const errors = ['TokenExpiredError', 'NotBeforeError', 'JsonWebTokenError'];
    if (errors.includes(error?.name)) {
      return next(new UnAuthorizedError('Please authenticate'));
    }
    return next(error);
  }
};

module.exports = {

  getIo: (server) => {
    const io = new Server(server, {
      cors: {
        origin: '*',
      },
    });

    io.use((client, next) => authenticate(client, next))
      .on('connection', async (client) => {
        /* start of adding user to list of onlne users and joining old rooms */
        console.log('connection made', client.id, client.data.user._id);
        const { _id } = client.data.user;

        // add user to list of online users
        registerUser(_id, client.id);

        // fetch user conversations && chatRooms
        const conversations = await getConversations(_id);
        const chatRooms = await getChatRooms(_id);

        // check if their are old conv
        if (conversations.length) {
          // join the user to each conv
          conversations.forEach((conv) => {
            client.join(String(conv._id));
          });
        }

        // check if their are old chatRooms
        if (chatRooms.length) {
          // join the user to each chatRoom
          chatRooms.forEach((chatRoom) => {
            client.join(String(chatRoom._id));
          });
        }

        // emit online users to update on frontend
        io.emit('online-users', users);
        /* end of adding user to list of onlne users and joining old room */

        /* Start of conversation and chatRoom clients */
        // call this
        // for start of new conv and chatroom
        // join room use && isRoom to check if it is room
        // emit user-joined room if isRoom true
        client.on('join-room', ({
          roomId, isChatRoom,
        }) => {
        // add the user to the room
          client.join(roomId);
          // eslint-disable-next-line no-unused-expressions
          isChatRoom
        && io.in(roomId).emit('new-user-joined', { user: client.data.user });
        });

        // on message
        client.on('new-message', ({
          roomId, isChatRoom, payload,
        }) => {
        // emit message
          io.in(roomId).emit('new-message', {
            roomId, sender: client.data.user, isChatRoom, payload,
          });
        });

        // on typing message
        client.on('typing-message', ({ roomId, isChatRoom }) => {
        // emit user is is typing
          io.in(roomId).emit('typing-message', { roomId, user: client.data.user, isChatRoom });
        });

        // on message-read
        client.on('message-read', ({
          roomId, isChatRoom, payload,
        }) => {
        // emit room-message-read
          io.in(roomId).emit('message-read', {
            roomId, user: client.data.user, isChatRoom, payload,
          });
        });

        // block user
        client.on('block-conversation', ({ roomId }) => {
          io.in(roomId).emit('block-conversation', { roomId, user: client.data.user });
        });

        // unblock conversation
        client.on('unblock-conversation', ({ roomId }) => {
          io.in(roomId).emit('unblock-conversation', { roomId, user: client.data.user });
        });

        // on remove-user
        client.on('remove-user', ({ roomId, userId }) => {
          // emit user removed
          io.in(roomId).emit('user-removed', { userId, admin: client.data.user });
          // get user to be removed socketId if is online
          const socketId = getUser(userId);
          if (socketId) {
            // get user to be removed socket connection
            const userSocket = io.sockets.sockets.get(socketId.socketId);
            // stop the user from listening the chatRoom events
            userSocket.leave(roomId);
          }
        });

        // on leave room,
        client.on('leave-room', ({ roomId }) => {
        // eslint-disable-next-line no-unused-expressions
          io.in(roomId).emit('user-left', { user: client.data.user });
          // remove the user from room
          client.leave(roomId);
        });

        /* end of conversation and chatRoom clients */

        // notification
        client.on('new-notification', ({ userId }) => {
          const to = getUser(userId);
          if (to) {
            io.to(to.clientId).emit('new-notification');
          }
        });
        // reomve user from list of online users
        client.on('disconnect', () => {
          removeUser(client.id);
          io.emit('online-users', users);
        });

        // end of clients
      });

    return io;
  },
};
