import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';

let io: SocketIOServer | null = null;

export const initSocket = (server: HTTPServer) => {
    io = new SocketIOServer(server, {
        cors: {
            origin: [
                'http://localhost:3000',
                'https://aiupsellengine1.vercel.app',
                'https://aiupsellengine.mohammadaman.in',
                /\.vercel\.app$/,
                'https://keila-arousable-bimolecularly.ngrok-free.dev'
            ],
            methods: ["GET", "POST"]
        }
    });

    io.on('connection', (socket) => {
        console.log(`[Socket] ⚡ New connection: ${socket.id}`);

        socket.on('disconnect', () => {
            console.log(`[Socket] 🔌 Disconnected: ${socket.id}`);
        });
    });

    return io;
};

export const getIO = () => {
    if (!io) {
        throw new Error('Socket.io not initialized!');
    }
    return io;
};

export const emitEvent = (event: string, data: any) => {
    if (io) {
        console.log(`[Socket] 📡 Emitting: ${event}`, data);
        io.emit(event, data);
    }
};
