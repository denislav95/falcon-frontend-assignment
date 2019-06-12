const WebSocketServer = require('websocket').server;
const http = require('http');

const CHANNEL_FULL_ERROR = { error: 'CHANNEL_FULL' };
const CHANNEL_NOT_DEFINED_ERROR = { error: 'CHANNEL_NOT_DEFINED' };
const JOIN_CHANNEL = 'JOIN_CHANNEL';
const LEAVE_CHANNEL = 'LEAVE_CHANNEL';
const GET_CHANNELS = 'GET_CHANNELS';
const START_GAME = 'START_GAME';
const CURRENT_PLAYER = 'CURRENT_PLAYER';
const UPDATE_BOARD = 'UPDATE_BOARD';
const CHANNELS = new Map();

const server = http.createServer(({ response }) => {
    response.writeHead(404);
    response.end();
});

server.listen(4000, () => console.log('API is up an running at port 4000'));

const WS_SERVER = new WebSocketServer({
    httpServer: server,
    autoAcceptConnections: false
});

const whitelist = ['http://localhost:4200'];
const isValidOrigin = origin => whitelist.includes(origin);

const isGetChannelsEvent = message =>
    (message.type && message.payload && message.type === GET_CHANNELS)


const isJoinChannelEvent = message =>
    (message.type && message.payload && message.type === JOIN_CHANNEL)

const isStartGameEvent = message =>
(message.type && message.payload && message.type === START_GAME)

const isCurrentPlayerEvent = message =>
(message.type && message.payload && message.type === CURRENT_PLAYER)

const isGameBoardEvent = message =>
(message.type && message.payload && message.type === UPDATE_BOARD)


const isLeaveChannelEvent = message =>
    (message.type && message.type === LEAVE_CHANNEL)

const leaveAllChannels = (connection) => {
  CHANNELS.forEach((x, channelName) => leaveChannel(channelName, connection));
}
const leaveChannel = (channelName, connection) => {
    const { channel, error } = getChannelByName(channelName);
    if (error) {
      return connection.send(getError(channelName, error));
    }

    channel.connections.delete(connection);
    if (channel.connections.size === 0) {
      CHANNELS.delete(channel.name);
    }
}
const getChannel = (channelConfig) => {
    if (!CHANNELS.has(channelConfig.name)) {
        CHANNELS.set(channelConfig.name, {
            users: [],
            connections: new Set(),
            ...channelConfig
        });
    }
    return CHANNELS.get(channelConfig.name);
};
const joinChannel = (message, connection, username) => {
    let channel = getChannel(message.payload);
    if (channel.connections.size === channel.maxSize) {
        return CHANNEL_FULL_ERROR;
    }
    channel.users.push(username);
    channel.connections.add(connection);
    return { channel };
}
const getChannelByName = channelName => {
  const channel = CHANNELS.get(channelName);
  if (!channel) {
    return CHANNEL_NOT_DEFINED_ERROR;
  }
  return { channel };
};
const sendToAllUsers = (channel, channelName, type, message) => {
  Array.from(channel.connections)
    .forEach(con => con.send(JSON.stringify({
      type: type,
      message: message,
      channel: {
        users: channel.users,
        size: channel.connections.size,
        name: channelName
      }
    }
  )));
};
const getError = (channelName, error) => JSON.stringify({
    channel: { name: channelName },
    ...error
})

WS_SERVER.on('request', request => {
    if (!isValidOrigin(request.origin)) {
        request.reject();
        return;
    };

    const connection = request.accept('echo-protocol', request.origin);

    // Broadcast incoming messages back to other connections on channel
    // First connection to send a JOIN_CHANNEL message, creates the channel
    connection.on('message', (data) => {
        const { message, channelName, meta = {} } = JSON.parse(data.utf8Data);

        if (isJoinChannelEvent(message)) {
          let { error } = joinChannel(message, connection, meta.name);
          if (error) {
              return connection.send(getError(channelName, error));
          }
        }

        if (isStartGameEvent(message)) {
          const { error, channel } = getChannelByName(channelName);
          if (error) {
            return connection.send(getError(channelName, error));
          }

          sendToAllUsers(channel, channelName, START_GAME, true);
        }

        if (isCurrentPlayerEvent(message)) {
          const { error, channel } = getChannelByName(channelName);
          if (error) {
            return connection.send(getError(channelName, error));
          }

          const messageToSend =  { currentPlayer: message.payload.currentPlayer, board: message.payload.board };
          sendToAllUsers(channel, channelName, CURRENT_PLAYER, messageToSend);
        }

        if (isGameBoardEvent(message)) {
          const { error, channel } = getChannelByName(channelName);
          if (error) {
            return connection.send(getError(channelName, error));
          }

          const messageToSend =  { board: message.payload.board, winner: message.payload.winner, pieces: message.payload.pieces };
          sendToAllUsers(channel, channelName, UPDATE_BOARD, messageToSend);
        }

        if (isGetChannelsEvent(message)) {
          const { error, channel } = getChannelByName(channelName);
          if (error) {
            return connection.send(getError(channelName, error));
          }
          connection.send(JSON.stringify({
            type: GET_CHANNELS,
            message: Array.from(CHANNELS.keys()),
            channel: {
              users: channel.users,
              size: channel.connections.size,
              name: channelName
            }
          }))
        }

        if (isLeaveChannelEvent(message)) {
          leaveChannel(channelName, connection);
        }


        const { error, channel } = getChannelByName(channelName);
        if (error) {
          return connection.send(getError(channelName, error));
        }

        Array.from(channel.connections)
            .filter(con => con !== connection)
            .forEach(con => con.send(JSON.stringify({
                    message, meta,
                    channel: {
                        size: channel.connections.size,
                        name: channelName
                    }
                }
            )));
    });

    connection.on('close', () => leaveAllChannels(connection));
});

