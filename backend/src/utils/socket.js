const socketIo = require('socket.io');

let io;

const init = (server, allowedOrigins) => {
    io = socketIo(server, {
        cors: {
            origin: allowedOrigins,
            methods: ["GET", "POST"],
            credentials: true
        }
    });

    io.on('connection', (socket) => {
        console.log('New client connected:', socket.id);

        socket.on('join', (room) => {
            socket.join(room);
            console.log(`Client ${socket.id} joined room: ${room}`);
        });

        socket.on('disconnect', () => {
            console.log('Client disconnected:', socket.id);
        });
    });

    return io;
};

const getIO = () => {
    if (!io) {
        throw new Error('Socket.io not initialized!');
    }
    return io;
};

/**
 * Send a notification to a specific room (usually organization ID)
 * @param {string} room 
 * @param {string} type 
 * @param {object} data 
 */
const sendNotification = (room, type, data) => {
    if (io) {
        io.to(room).emit('notification', {
            type,
            data,
            timestamp: new Date()
        });
    }
};

module.exports = {
    init,
    getIO,
    sendNotification
};
