import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import prisma from './prisma';

const PORT = process.env.PORT || 3001;

async function startServer() {
    try {
        await prisma.$connect();
        console.log('📦 Database connected successfully');

        app.listen(PORT, () => {
            console.log(`🚀 Server running on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('❌ Error starting server:', error);
        process.exit(1);
    }
}

startServer();
