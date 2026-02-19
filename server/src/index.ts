import http from 'http';
import app from './app';
import { initSocket } from './lib/socket';

const PORT = process.env.PORT || 5001;
const server = http.createServer(app);

// Initialize Socket.io
initSocket(server);

server.listen(PORT, () => {
    console.log(`🚀 Velocity AI Server running on port ${PORT}`);
    console.log(`📡 Intelligence Core: http://localhost:${PORT}/api/v1`);
});
