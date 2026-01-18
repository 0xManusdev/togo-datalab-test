/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    roots: ['<rootDir>/tests'],
    testMatch: ['**/*.test.ts'],
    transform: {
        '^.+\\.ts$': ['ts-jest', { tsconfig: 'tsconfig.test.json' }]
    },
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
        '^@config/(.*)$': '<rootDir>/src/config/$1',
        '^@controllers/(.*)$': '<rootDir>/src/controllers/$1',
        '^@dto/(.*)$': '<rootDir>/src/dto/$1',
        '^@middleware/(.*)$': '<rootDir>/src/middleware/$1',
        '^@routes/(.*)$': '<rootDir>/src/routes/$1',
        '^@services/(.*)$': '<rootDir>/src/services/$1',
        '^@utils/(.*)$': '<rootDir>/src/utils/$1',
        '^@errors/(.*)$': '<rootDir>/src/errors/$1',
    },
    setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
    collectCoverageFrom: [
        'src/**/*.ts',
        '!src/generated/**',
        '!src/server.ts',
    ],
    coverageDirectory: 'coverage',
    verbose: true,
};
