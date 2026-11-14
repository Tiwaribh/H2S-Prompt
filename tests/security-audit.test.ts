import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

test('Security & Architecture Audit', async (t) => {
  const rootDir = process.cwd();
  const packageJson = JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf-8'));
  const gitignoreContent = fs.readFileSync(path.join(rootDir, '.gitignore'), 'utf-8');

  await t.test('ZERO-DATABASE INVARIANT: No persistent backend database libraries installed', () => {
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
      assert.ok(
        !allDeps[pkg],
        `Security policy violation: prohibited database package "${pkg}" detected in dependencies.`
      );
    }
  });

  await t.test('ENVIRONMENT PROTECTION: Gitignore strictly ignores environment secrets and service accounts', () => {
    assert.ok(gitignoreContent.includes('.env*.local'), 'Missing .env*.local in .gitignore');
    assert.ok(gitignoreContent.includes('*serviceAccount*.json'), 'Missing *serviceAccount*.json in .gitignore');
    assert.ok(gitignoreContent.includes('*credentials*.json'), 'Missing *credentials*.json in .gitignore');
  });

  await t.test('API KEY SAFETY: Server-only Gemini API key is never prefixed with NEXT_PUBLIC_', () => {
    const envExample = fs.readFileSync(path.join(rootDir, '.env.example'), 'utf-8');
    assert.ok(!envExample.includes('NEXT_PUBLIC_GEMINI_API_KEY'), 'Gemini API key must never have NEXT_PUBLIC_ prefix.');
    assert.ok(envExample.includes('GEMINI_API_KEY='), 'GEMINI_API_KEY must be a backend server environment variable.');
  });
});
