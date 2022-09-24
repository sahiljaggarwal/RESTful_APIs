import dotenv from 'dotenv';
dotenv.config();

export const {
    DB_URL,
    APP_PORT,
    DEBUG_MODE,
    JWT_SECRET,
    REFRESH_SECRET,
    APP_URL
} = process.env;