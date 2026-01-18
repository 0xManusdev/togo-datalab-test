import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { authenticate, authorizeAdmin, AuthRequest } from '@/middleware/auth.middleware';
import { UnauthorizedError } from '@/errors/AppError';

jest.mock('jsonwebtoken');

const mockJwt = jwt as jest.Mocked<typeof jwt>;

describe('Auth Middleware', () => {
    let mockRequest: Partial<AuthRequest>;
    let mockResponse: Partial<Response>;
    let nextFunction: NextFunction;

    beforeEach(() => {
        mockRequest = {
            cookies: {},
        };
        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        nextFunction = jest.fn();
    });

    describe('authenticate', () => {
        it('devrait passer si un token valide est fourni', () => {
            mockRequest.cookies = { token: 'valid-token' };
            mockJwt.verify.mockReturnValue({ userId: 'user-1', role: 'EMPLOYEE' } as any);

            authenticate(mockRequest as AuthRequest, mockResponse as Response, nextFunction);

            expect(mockRequest.user).toEqual({ userId: 'user-1', role: 'EMPLOYEE' });
            expect(nextFunction).toHaveBeenCalledWith();
        });

        it('devrait rejeter si aucun token n\'est fourni', () => {
            mockRequest.cookies = {};

            authenticate(mockRequest as AuthRequest, mockResponse as Response, nextFunction);

            expect(nextFunction).toHaveBeenCalledWith(expect.any(UnauthorizedError));
        });

        it('devrait rejeter si le token est invalide', () => {
            mockRequest.cookies = { token: 'invalid-token' };
            mockJwt.verify.mockImplementation(() => {
                throw new jwt.JsonWebTokenError('invalid token');
            });

            authenticate(mockRequest as AuthRequest, mockResponse as Response, nextFunction);

            expect(nextFunction).toHaveBeenCalledWith(expect.any(UnauthorizedError));
        });

        it('devrait rejeter si le token a expiré', () => {
            mockRequest.cookies = { token: 'expired-token' };
            // Simulate token expiration by throwing a JsonWebTokenError
            // In real code, TokenExpiredError extends JsonWebTokenError
            const expiredError = new jwt.JsonWebTokenError('jwt expired');
            mockJwt.verify.mockImplementation(() => {
                throw expiredError;
            });

            authenticate(mockRequest as AuthRequest, mockResponse as Response, nextFunction);

            // Should be converted to UnauthorizedError
            expect(nextFunction).toHaveBeenCalledWith(expect.any(UnauthorizedError));
        });
    });

    describe('authorizeAdmin', () => {
        it('devrait passer si l\'utilisateur est admin', () => {
            mockRequest.user = { userId: 'admin-1', role: 'ADMIN' };

            authorizeAdmin(mockRequest as AuthRequest, mockResponse as Response, nextFunction);

            expect(nextFunction).toHaveBeenCalledWith();
        });

        it('devrait rejeter si l\'utilisateur est EMPLOYEE', () => {
            mockRequest.user = { userId: 'user-1', role: 'EMPLOYEE' };

            authorizeAdmin(mockRequest as AuthRequest, mockResponse as Response, nextFunction);

            expect(nextFunction).toHaveBeenCalledWith(expect.any(UnauthorizedError));
        });

        it('devrait rejeter si aucun utilisateur n\'est défini', () => {
            mockRequest.user = undefined;

            authorizeAdmin(mockRequest as AuthRequest, mockResponse as Response, nextFunction);

            expect(nextFunction).toHaveBeenCalledWith(expect.any(UnauthorizedError));
        });
    });
});
