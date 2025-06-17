import { Response } from 'express';
import { ZodError } from 'zod';

// Standard response interfaces
export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data?: T;
    errors?: any;
}

export interface ErrorResponse extends ApiResponse<null> {
    success: false;
    error?: any;
    code?: string;
}

// Success response helper
export const sendSuccess = <T>(res: Response, data: T, message: string = 'Success'): void => {
    const response: ApiResponse<T> = {
        success: true,
        message,
        data
    };
    res.status(200).json(response);
};

// Not found response helper
export const sendNotFound = (res: Response, message: string = 'Resource not found'): void => {
    const response: ApiResponse<null> = {
        success: true,
        message,
        data: null
    };
    res.status(200).json(response);
};

// Error response helper
export const sendError = (res: Response, error: unknown): void => {
    if (error instanceof ZodError) {
        const response: ErrorResponse = {
            success: false,
            message: 'Validation error',
            errors: error.errors
        };
        res.status(400).json(response);
        return;
    }

    if (error instanceof Error) {
        const response: ErrorResponse = {
            success: false,
            message: error.message
        };
        res.status(400).json(response);
        return;
    }

    const response: ErrorResponse = {
        success: false,
        message: 'Internal server error'
    };
    res.status(500).json(response);
};

// Validation error helper
export const sendValidationError = (res: Response, message: string): void => {
    const response: ErrorResponse = {
        success: false,
        message
    };
    res.status(400).json(response);
};

// Unauthorized error helper
export const sendUnauthorized = (res: Response, message: string = 'Unauthorized'): void => {
    const response: ErrorResponse = {
        success: false,
        message
    };
    res.status(401).json(response);
};

// Forbidden error helper
export const sendForbidden = (res: Response, message: string = 'Forbidden'): void => {
    const response: ErrorResponse = {
        success: false,
        message
    };
    res.status(403).json(response);
}; 