import type { Config } from 'jest'
import nextJest from 'next/jest.js'

// Mostra pro Jest onde está o Next.js para ele ler o next.config.ts e o .env
const createJestConfig = nextJest({
  dir: './',
})

// Configuração principal do Jest
const config: Config = {
  coverageProvider: 'v8',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  
  // MUDANÇA: Dizemos para o Jest ignorar a pasta do Playwright e a do Next!
  testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/tests/'], 
  
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
}

export default createJestConfig(config)