import { Request, Response, NextFunction } from 'express';
import logger from '../lib/logger';

/**
 * Global Error Handling Middleware
 */
export const globalErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';

    logger.error('Unhandled Error', {
        path: req.path,
        method: req.method,
        error: message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });

    res.status(statusCode).json({
        status: 'error',
        statusCode,
        message: process.env.NODE_ENV === 'development' ? message : 'An unexpected error occurred'
    });
};
