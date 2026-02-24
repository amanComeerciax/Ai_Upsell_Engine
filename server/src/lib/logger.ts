const logger = {
    info: (message: string, meta?: any) => {
        console.log(JSON.stringify({ timestamp: new Date().toISOString(), level: 'INFO', message, ...meta }));
    },
    warn: (message: string, meta?: any) => {
        console.warn(JSON.stringify({ timestamp: new Date().toISOString(), level: 'WARN', message, ...meta }));
    },
    error: (message: string, meta?: any) => {
        console.error(JSON.stringify({ timestamp: new Date().toISOString(), level: 'ERROR', message, ...meta }));
    }
};

export default logger;
