import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Client } from 'pg';
import * as request from 'supertest';

import { AppModule } from '../src/app.module';
import { UserRole } from '../src/modules/users/user.types';

jest.setTimeout(60_000);

function setupEnv() {
  process.env.APP_PORT = '0';
  process.env.POSTGRES_HOST = process.env.POSTGRES_HOST ?? '127.0.0.1';
  process.env.POSTGRES_PORT = process.env.POSTGRES_PORT ?? '5433';
  process.env.POSTGRES_USER = process.env.POSTGRES_USER ?? 'crm';
  process.env.POSTGRES_PASSWORD = process.env.POSTGRES_PASSWORD ?? 'crm';
  process.env.POSTGRES_DB = process.env.POSTGRES_DB ?? 'crm';
  process.env.TYPEORM_SYNCHRONIZE = 'true';
  process.env.TYPEORM_DROP_SCHEMA = 'true';
  process.env.JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET ?? 'test_access_secret';
  process.env.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET ?? 'test_refresh_secret';
  process.env.JWT_ACCESS_TTL = '15m';
  process.env.JWT_REFRESH_TTL = '7d';
}

async function waitForPostgresReady() {
  const startedAt = Date.now();
  let lastError: unknown = null;
  while (Date.now() - startedAt < 30_000) {
    const client = new Client({
      host: process.env.POSTGRES_HOST,
      port: Number(process.env.POSTGRES_PORT),
      user: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DB,
    });
    try {
      await client.connect();
      await client.query('select 1 as ok');
      await client.end();
      return;
    } catch (error) {
      lastError = error;
      try {
        await client.end();
      } catch {
        // ignore
      }
      await new Promise((r) => setTimeout(r, 500));
    }
  }

  throw lastError ?? new Error('Postgres is not ready');
}

describe('CRM Task Comments API (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    setupEnv();
    await waitForPostgresReady();
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    if (app) await app.close();
  });

  it('registers via /users/register and returns token pair', async () => {
    const res = await request(app.getHttpServer()).post('/users/register').send({
      password: 'StrongPassword123',
      role: UserRole.USER,
    });

    expect(res.status).toBe(201);
    expect(res.body.accessToken).toBeTruthy();
    expect(res.body.refreshToken).toBeTruthy();
  });

  it('enforces: only user can create task; only author can create comment; only owner can edit comment', async () => {
    const userReg = await request(app.getHttpServer()).post('/users/register').send({
      password: 'UserPassword123',
      role: UserRole.USER,
    });
    const userAccess = userReg.body.accessToken as string;

    const authorReg = await request(app.getHttpServer()).post('/users/register').send({
      password: 'AuthorPassword123',
      role: UserRole.AUTHOR,
    });
    const authorAccess = authorReg.body.accessToken as string;

    const forbiddenTask = await request(app.getHttpServer())
      .post('/tasks')
      .set('Authorization', `Bearer ${authorAccess}`)
      .send({ description: 'Task by author', comment: 'Initial comment' });
    expect(forbiddenTask.status).toBe(403);

    const task1 = await request(app.getHttpServer())
      .post('/tasks')
      .set('Authorization', `Bearer ${userAccess}`)
      .send({ description: 'Task 1', comment: 'Initial comment 1' });
    expect(task1.status).toBe(201);
    expect(task1.body.id).toBeTruthy();

    const forbiddenComment = await request(app.getHttpServer())
      .post('/comments')
      .set('Authorization', `Bearer ${userAccess}`)
      .send({ taskId: task1.body.id, text: 'User comment' });
    expect(forbiddenComment.status).toBe(403);

    const comment1 = await request(app.getHttpServer())
      .post('/comments')
      .set('Authorization', `Bearer ${authorAccess}`)
      .send({ taskId: task1.body.id, text: 'Author comment 1' });
    expect(comment1.status).toBe(201);
    expect(comment1.body.id).toBeTruthy();

    const commentList = await request(app.getHttpServer())
      .get(`/comments?task_id=${task1.body.id}`)
      .set('Authorization', `Bearer ${authorAccess}`);
    expect(commentList.status).toBe(200);
    expect(Array.isArray(commentList.body)).toBe(true);
    expect(commentList.body.length).toBeGreaterThanOrEqual(1);

    const anotherAuthor = await request(app.getHttpServer()).post('/users/register').send({
      password: 'AnotherAuthorPassword123',
      role: UserRole.AUTHOR,
    });
    const anotherAuthorAccess = anotherAuthor.body.accessToken as string;

    const forbiddenEdit = await request(app.getHttpServer())
      .patch(`/comments/${comment1.body.id}`)
      .set('Authorization', `Bearer ${anotherAuthorAccess}`)
      .send({ text: 'Hacked' });
    expect(forbiddenEdit.status).toBe(403);

    const okEdit = await request(app.getHttpServer())
      .patch(`/comments/${comment1.body.id}`)
      .set('Authorization', `Bearer ${authorAccess}`)
      .send({ text: 'Updated text' });
    expect(okEdit.status).toBe(200);
    expect(okEdit.body.text).toBe('Updated text');
  });

  it('returns tasks sorted by date (newest first)', async () => {
    const userReg = await request(app.getHttpServer()).post('/users/register').send({
      password: 'UserPassword456',
      role: UserRole.USER,
    });
    const userAccess = userReg.body.accessToken as string;

    const t1 = await request(app.getHttpServer())
      .post('/tasks')
      .set('Authorization', `Bearer ${userAccess}`)
      .send({ description: 'Older task', comment: 'Older comment' });
    expect(t1.status).toBe(201);

    const t2 = await request(app.getHttpServer())
      .post('/tasks')
      .set('Authorization', `Bearer ${userAccess}`)
      .send({ description: 'Newer task', comment: 'Newer comment' });
    expect(t2.status).toBe(201);

    const list = await request(app.getHttpServer())
      .get('/tasks')
      .set('Authorization', `Bearer ${userAccess}`);
    expect(list.status).toBe(200);

    expect(list.body[0].id).toBe(t2.body.id);
    expect(list.body[1].id).toBe(t1.body.id);
  });

  it('rotates refresh tokens (refresh returns new pair)', async () => {
    const reg = await request(app.getHttpServer()).post('/auth/register').send({
      password: 'RotatePassword123',
      role: UserRole.USER,
    });
    expect(reg.status).toBe(201);
    const refreshToken1 = reg.body.refreshToken as string;

    const refreshed = await request(app.getHttpServer()).post('/auth/refresh').send({
      refreshToken: refreshToken1,
    });
    expect(refreshed.status).toBe(200);
    expect(refreshed.body.accessToken).toBeTruthy();
    expect(refreshed.body.refreshToken).toBeTruthy();
    expect(refreshed.body.refreshToken).not.toBe(refreshToken1);

    const oldRefreshRejected = await request(app.getHttpServer()).post('/auth/refresh').send({
      refreshToken: refreshToken1,
    });
    expect(oldRefreshRejected.status).toBe(403);
  });
});
