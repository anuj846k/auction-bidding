import app from '#src/app.js';
import request from 'supertest';

describe('API endpoints', () => {
  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app).get('/health').expect(200);
      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('uptime');
    });
  });

  describe('GET /api', () => {
    it('should return API message', async () => {
      const response = await request(app).get('/api').expect(200);
      expect(response.body).toHaveProperty(
        'message',
        'Acquistions api Running!!'
      );
    });
  });

  describe('GET /nonexistent', () => {
    it('should return 404 for non-existent routes', async () => {
      const response = await request(app).get('/nonexistent').expect(404);
      expect(response.body).toHaveProperty('error', 'Route not found');
    });
  });
});

describe('Items API', () => {
  describe('GET /api/items', () => {
    it('should return array of active auction items', async () => {
      const response = await request(app).get('/api/items').expect(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should return items with required fields', async () => {
      const response = await request(app).get('/api/items').expect(200);
      if (response.body.length > 0) {
        const item = response.body[0];
        expect(item).toHaveProperty('id');
        expect(item).toHaveProperty('title');
        expect(item).toHaveProperty('startingPrice');
        expect(item).toHaveProperty('currentBid');
        expect(item).toHaveProperty('auctionEndTime');
        expect(item).toHaveProperty('lastBidderId');
      }
    });

    it('should only return active items (auction not ended)', async () => {
      const response = await request(app).get('/api/items').expect(200);
      const now = new Date();
      response.body.forEach(item => {
        const endTime = new Date(item.auctionEndTime);
        expect(endTime.getTime()).toBeGreaterThan(now.getTime());
      });
    });
  });

  describe('GET /api/items/server-time', () => {
    it('should return server time', async () => {
      const response = await request(app)
        .get('/api/items/server-time')
        .expect(200);
      expect(response.body).toHaveProperty('serverTime');
      expect(response.body).toHaveProperty('timestamp');
      expect(typeof response.body.timestamp).toBe('number');
    });

    it('should return valid ISO timestamp', async () => {
      const response = await request(app)
        .get('/api/items/server-time')
        .expect(200);
      const serverTime = new Date(response.body.serverTime);
      expect(serverTime.getTime()).not.toBeNaN();
    });
  });
});

describe('Authentication API', () => {
  const testUser = {
    name: 'Test User',
    email: `test${Date.now()}@example.com`,
    password: 'TestPassword123!',
  };

  describe('POST /api/auth/sign-up', () => {
    it('should create a new user', async () => {
      const response = await request(app)
        .post('/api/auth/sign-up')
        .send(testUser)
        .expect(201);

      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user).toHaveProperty('email', testUser.email);
      expect(response.body.user).toHaveProperty('name', testUser.name);
      expect(response.body.user).not.toHaveProperty('password');
    });

    it('should set authentication cookie', async () => {
      const response = await request(app)
        .post('/api/auth/sign-up')
        .send({
          name: 'Cookie Test',
          email: `cookie${Date.now()}@example.com`,
          password: 'TestPassword123!',
        })
        .expect(201);

      const cookies = response.headers['set-cookie'];
      expect(cookies).toBeDefined();
      const tokenCookie = cookies.find(cookie => cookie.startsWith('token='));
      expect(tokenCookie).toBeDefined();
    });

    it('should reject duplicate email', async () => {
      const duplicateTestUser = {
        name: 'Duplicate Test User',
        email: `duplicate${Date.now()}@example.com`,
        password: 'TestPassword123!',
      };

      await request(app)
        .post('/api/auth/sign-up')
        .send(duplicateTestUser)
        .expect(201);

      const response = await request(app)
        .post('/api/auth/sign-up')
        .send(duplicateTestUser)
        .expect(409);

      expect(response.body).toHaveProperty('error');
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/auth/sign-up')
        .send({ email: 'incomplete@example.com' })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/auth/sign-in', () => {
    beforeEach(async () => {
      await request(app).post('/api/auth/sign-up').send(testUser);
    });

    it('should authenticate with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/sign-in')
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe(testUser.email);
    });

    it('should set authentication cookie on sign-in', async () => {
      const response = await request(app)
        .post('/api/auth/sign-in')
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(200);

      const cookies = response.headers['set-cookie'];
      expect(cookies).toBeDefined();
      const tokenCookie = cookies.find(cookie => cookie.startsWith('token='));
      expect(tokenCookie).toBeDefined();
    });

    it('should reject invalid password', async () => {
      const response = await request(app)
        .post('/api/auth/sign-in')
        .send({
          email: testUser.email,
          password: 'WrongPassword123!',
        })
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });

    it('should reject non-existent user', async () => {
      const response = await request(app)
        .post('/api/auth/sign-in')
        .send({
          email: 'nonexistent@example.com',
          password: 'SomePassword123!',
        })
        .expect(404);

      expect(response.body).toHaveProperty('error', 'User not found');
    });
  });

  describe('GET /api/auth/me', () => {
    let authCookie;

    beforeEach(async () => {
      await request(app).post('/api/auth/sign-up').send(testUser);
      const signInResponse = await request(app).post('/api/auth/sign-in').send({
        email: testUser.email,
        password: testUser.password,
      });
      authCookie = signInResponse.headers['set-cookie'];
    });

    it('should return current user when authenticated', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Cookie', authCookie)
        .expect(200);

      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user).toHaveProperty('email', testUser.email);
      expect(response.body.user).toHaveProperty('name', testUser.name);
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app).get('/api/auth/me').expect(401);

      expect(response.body).toHaveProperty('error', 'Unauthorized');
    });
  });

  describe('POST /api/auth/sign-out', () => {
    let authCookie;

    beforeEach(async () => {
      await request(app).post('/api/auth/sign-up').send(testUser);
      const signInResponse = await request(app).post('/api/auth/sign-in').send({
        email: testUser.email,
        password: testUser.password,
      });
      authCookie = signInResponse.headers['set-cookie'];
    });

    it('should clear authentication cookie', async () => {
      const response = await request(app)
        .post('/api/auth/sign-out')
        .set('Cookie', authCookie)
        .expect(200);

      const cookies = response.headers['set-cookie'];
      expect(cookies).toBeDefined();
      const tokenCookie = cookies.find(cookie => cookie.startsWith('token='));
      expect(tokenCookie).toBeDefined();
      expect(tokenCookie).toContain('Expires=');
      expect(tokenCookie).toContain('1970');
    });
  });
});

describe('Bids API', () => {
  const testUser = {
    name: 'Bid Test User',
    email: `bidtest${Date.now()}@example.com`,
    password: 'TestPassword123!',
  };
  let authCookie;

  beforeEach(async () => {
    await request(app).post('/api/auth/sign-up').send(testUser);
    const signInResponse = await request(app).post('/api/auth/sign-in').send({
      email: testUser.email,
      password: testUser.password,
    });
    authCookie = signInResponse.headers['set-cookie'];
  });

  describe('GET /api/bids/my', () => {
    it('should return user bids when authenticated', async () => {
      const response = await request(app)
        .get('/api/bids/my')
        .set('Cookie', authCookie)
        .expect(200);

      expect(response.body).toHaveProperty('bids');
      expect(response.body).toHaveProperty('count');
      expect(Array.isArray(response.body.bids)).toBe(true);
      expect(typeof response.body.count).toBe('number');
    });

    it('should return bids with item details', async () => {
      const response = await request(app)
        .get('/api/bids/my')
        .set('Cookie', authCookie)
        .expect(200);

      if (response.body.bids.length > 0) {
        const bid = response.body.bids[0];
        expect(bid).toHaveProperty('id');
        expect(bid).toHaveProperty('amount');
        expect(bid).toHaveProperty('createdAt');
        expect(bid).toHaveProperty('item');
        expect(bid.item).toHaveProperty('id');
        expect(bid.item).toHaveProperty('title');
        expect(bid.item).toHaveProperty('currentBid');
      }
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app).get('/api/bids/my').expect(401);

      expect(response.body).toHaveProperty('error', 'Unauthorized');
    });

    it('should return empty array for user with no bids', async () => {
      const response = await request(app)
        .get('/api/bids/my')
        .set('Cookie', authCookie)
        .expect(200);

      expect(response.body.bids).toEqual([]);
      expect(response.body.count).toBe(0);
    });
  });
});
