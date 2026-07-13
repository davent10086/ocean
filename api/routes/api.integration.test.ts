import jwt from 'jsonwebtoken';
import request from 'supertest';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Express } from 'express';
import type { AuthUser } from '../../shared/types.js';

vi.stubEnv('DATABASE_URL', 'postgresql://postgres:postgres@localhost:5432/blue_ocean_library_test');
vi.stubEnv('JWT_SECRET', 'test-secret-with-at-least-thirty-two-chars');
vi.stubEnv('JWT_EXPIRES_IN', '1h');
vi.stubEnv('CORS_ORIGIN', 'http://localhost:5173');
vi.stubEnv('DEEPSEEK_API_KEY', '');

vi.mock('../config/prisma.js', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
  },
}));

vi.mock('../services/auth.service.js', () => ({
  login: vi.fn(),
  register: vi.fn(),
}));

vi.mock('../services/book.service.js', () => ({
  listBooks: vi.fn(),
  createBook: vi.fn(),
  updateBook: vi.fn(),
  deleteBook: vi.fn(),
}));

vi.mock('../services/borrow.service.js', () => ({
  listBorrowRecords: vi.fn(),
  createBorrowRecord: vi.fn(),
  returnBorrowRecord: vi.fn(),
}));

vi.mock('../services/dashboard.service.js', () => ({
  getAdminDashboardSummary: vi.fn(),
  getMemberDashboardSummary: vi.fn(),
}));

const adminUser: AuthUser = { id: 1, email: 'admin@blueocean.local', role: 'ADMIN' };
const memberUser: AuthUser = { id: 2, email: 'member@blueocean.local', role: 'MEMBER' };
const jwtSecret = 'test-secret-with-at-least-thirty-two-chars';

const tokenFor = (user: AuthUser) => jwt.sign(user, jwtSecret, { expiresIn: '1h' });

describe('API routes', () => {
  let app: Express;
  let prisma: typeof import('../config/prisma.js').prisma;
  let authService: typeof import('../services/auth.service.js');
  let bookService: typeof import('../services/book.service.js');
  let borrowService: typeof import('../services/borrow.service.js');
  let dashboardService: typeof import('../services/dashboard.service.js');

  beforeAll(async () => {
    app = (await import('../app.js')).default;
    prisma = (await import('../config/prisma.js')).prisma;
    authService = await import('../services/auth.service.js');
    bookService = await import('../services/book.service.js');
    borrowService = await import('../services/borrow.service.js');
    dashboardService = await import('../services/dashboard.service.js');
  });

  beforeEach(() => {
    vi.clearAllMocks();
    // The mocked route tests only exercise the selected auth fields, not a real Prisma client chain.
    vi.mocked(prisma.user.findUnique).mockImplementation((async ({ where }: { where: { id?: number } }) => {
      if (where.id === adminUser.id) {
        return { ...adminUser, disabled: false };
      }
      if (where.id === memberUser.id) {
        return { ...memberUser, disabled: false };
      }
      return null;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }) as any);
  });

  it('returns health check status', async () => {
    const response = await request(app).get('/api/health');

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      success: true,
      data: { status: 'ok' },
    });
  });

  it('logs in with valid payload', async () => {
    vi.mocked(authService.login).mockResolvedValue({ token: 'token', user: memberUser });

    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'member@blueocean.local', password: 'Member123!' });

    expect(response.status).toBe(200);
    expect(response.body.data.user.email).toBe(memberUser.email);
    expect(authService.login).toHaveBeenCalledWith('member@blueocean.local', 'Member123!');
  });

  it('rejects invalid register payload before service execution', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({ email: 'bad-email', password: 'weak', confirmPassword: 'weak' });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(authService.register).not.toHaveBeenCalled();
  });

  it('lets members list books', async () => {
    vi.mocked(bookService.listBooks).mockResolvedValue({ items: [], total: 0, page: 1, pageSize: 10 });

    const response = await request(app)
      .get('/api/books')
      .set('Authorization', `Bearer ${tokenFor(memberUser)}`);

    expect(response.status).toBe(200);
    expect(response.body.data.items).toEqual([]);
  });

  it('blocks members from creating books', async () => {
    const response = await request(app)
      .post('/api/books')
      .set('Authorization', `Bearer ${tokenFor(memberUser)}`)
      .send({ title: '测试图书', author: '作者', isbn: '9780000000011', publishYear: 2024, stock: 1 });

    expect(response.status).toBe(403);
    expect(bookService.createBook).not.toHaveBeenCalled();
  });

  it('lets admins create books', async () => {
    const book = {
      id: 1,
      title: '测试图书',
      author: '作者',
      isbn: '9780000000011',
      publishYear: 2024,
      stock: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    vi.mocked(bookService.createBook).mockResolvedValue(book);

    const response = await request(app)
      .post('/api/books')
      .set('Authorization', `Bearer ${tokenFor(adminUser)}`)
      .send({ title: '测试图书', author: '作者', isbn: '9780000000011', publishYear: 2024, stock: 1 });

    expect(response.status).toBe(201);
    expect(response.body.data.title).toBe('测试图书');
    expect(bookService.createBook).toHaveBeenCalledWith(adminUser.id, expect.objectContaining({ isbn: '9780000000011' }));
  });

  it('creates borrow records for authenticated members', async () => {
    vi.mocked(borrowService.createBorrowRecord).mockResolvedValue({
      id: 9,
      userId: memberUser.id,
      bookId: 1,
      borrowDate: new Date(),
      dueDate: new Date(),
      returnDate: null,
      status: 'BORROWED',
      user: memberUser,
      book: {
        id: 1,
        title: '测试图书',
        author: '作者',
        isbn: '9780000000011',
        publishYear: 2024,
        stock: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    const response = await request(app)
      .post('/api/borrow-records')
      .set('Authorization', `Bearer ${tokenFor(memberUser)}`)
      .send({ bookId: 1 });

    expect(response.status).toBe(201);
    expect(response.body.data.status).toBe('BORROWED');
    expect(borrowService.createBorrowRecord).toHaveBeenCalledWith(1, memberUser);
  });

  it('requires admin role for admin dashboard summary', async () => {
    const response = await request(app)
      .get('/api/dashboard')
      .set('Authorization', `Bearer ${tokenFor(memberUser)}`);

    expect(response.status).toBe(403);
    expect(dashboardService.getAdminDashboardSummary).not.toHaveBeenCalled();
  });

  it('keeps server running and disables only chat when DeepSeek key is missing', async () => {
    const response = await request(app)
      .post('/api/chat')
      .set('Authorization', `Bearer ${tokenFor(memberUser)}`)
      .send({ messages: [{ role: 'user', parts: [{ type: 'text', text: '你好' }] }] });

    expect(response.status).toBe(503);
    expect(response.body.message).toContain('AI 助手暂未配置');
  });
});
