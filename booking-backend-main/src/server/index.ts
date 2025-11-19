import { app } from './app/app';

// Node.js 22+ has native Promise and fetch support, no polyfills needed

// Constants
const PORT = app.get("port");

const startServer = () => {
    const listener = app.listen(PORT, () => {
        console.info(`Service is running at http://localhost:${PORT}`);
        console.info('MySQL connection pool created successfully');
    });

    listener.on('error', (error: any) => {
        if (error.code === 'EADDRINUSE') {
            console.error(`Port ${PORT} is already in use. Please stop the process using this port or change the port number.`);
            console.error('To find and kill the process:');
            console.error(`  Windows: netstat -ano | findstr :${PORT}`);
            console.error(`  Then: taskkill /PID [PID] /F`);
            process.exit(1);
        } else {
            console.error('Server error:', error);
            process.exit(1);
        }
    });

    process.on('SIGTERM', () => {
        listener.close(() => {
            console.error('Closing http server.');
            process.exit(0);
        });
    });

    process.on('SIGINT', () => {
        listener.close(() => {
            console.error('Closing http server.');
            process.exit(0);
        });
    });
};

startServer();

export { app };
