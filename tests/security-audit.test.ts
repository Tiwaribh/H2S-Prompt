import fs from 'fs';
import path from 'path';

describe('Security & Zero-Database Compliance Audit', () => {
  const rootDir = process.cwd();
  const packageJson = JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf-8'));
  const gitignoreContent = fs.readFileSync(path.join(rootDir, '.gitignore'), 'utf-8');

  it('ZERO-DATABASE INVARIANT: No persistent backend database libraries in dependencies', () => {
    const allDeps = {
      ...(packageJson.dependencies || {}),
      ...(packageJson.devDependencies || {}),
    };

    const databasePackages = [
      'mongoose',
      'mongodb',
      'pg',
      'mysql',
      'mysql2',
      'sqlite3',
      'better-sqlite3',
      'prisma',
      '@prisma/client',
      'typeorm',
      'sequelize',
      'redis',
      'ioredis',
      'firebase-admin',
    ];

    for (const pkg of databasePackages) {
      expect(allDeps[pkg]).toBeUndefined();
    }
  });

  it('ENVIRONMENT PROTECTION: Gitignore strictly ignores environment secrets and service accounts', () => {
    expect(gitignoreContent).toContain('.env*.local');
    expect(gitignoreContent).toContain('*serviceAccount*.json');
    expect(gitignoreContent).toContain('*credentials*.json');
  });

  it('API KEY SAFETY: Server-only Gemini API key is never prefixed with NEXT_PUBLIC_', () => {
    const envExample = fs.readFileSync(path.join(rootDir, '.env.example'), 'utf-8');
    expect(envExample).not.toContain('NEXT_PUBLIC_GEMINI_API_KEY');
    expect(envExample).toContain('GEMINI_API_KEY=');
  });

  it('PROBLEM STATEMENT INTEGRITY: Documents secondary provider environment variables (CPCB & OpenAQ)', () => {
    const envExample = fs.readFileSync(path.join(rootDir, '.env.example'), 'utf-8');
    expect(envExample).toContain('DATA_GOV_IN_API_KEY');
    expect(envExample).toContain('OPENAQ_API_KEY');
  });
});
