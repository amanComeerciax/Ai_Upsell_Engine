import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';

let io: SocketIOServer | null = null;

export const initSocket = (server: HTTPServer) => {
    io = new SocketIOServer(server, {
        cors: {
            origin: (origin, callback) => {
                // Allow: no origin (curl/Postman), localhost, ngrok tunnels, vercel, custom domain
                if (
                    !origin ||
                    origin.includes('localhost') ||
                    origin.includes('127.0.0.1') ||
                    origin.includes('ngrok') ||
                    origin.includes('vercel.app') ||
                    origin.includes('mohammadaman.in') ||
                    origin.includes('myshopify.com')
                ) {
                    callback(null, true);
                } else {
                    callback(new Error(`Socket CORS: origin not allowed → ${origin}`));
                }
            },
            methods: ["GET", "POST"],
            credentials: true
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
