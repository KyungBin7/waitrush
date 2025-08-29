import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { CreateOrganizerDto } from '../src/modules/auth/dto/create-organizer.dto';
import { LoginDto } from '../src/modules/auth/dto/login.dto';
import { getConnectionToken } from '@nestjs/mongoose';

describe('AuthController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    // Mock database connection for testing
    const mockConnection = {
      readyState: 1, // 1 = connected
      on: jest.fn(),
      once: jest.fn(),
      off: jest.fn(),
      emit: jest.fn(),
      close: jest.fn().mockResolvedValue(undefined),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(getConnectionToken())
      .useValue(mockConnection)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('/auth/signup (POST)', () => {
    const validSignupDto: CreateOrganizerDto = {
      email: 'test@example.com',
      password: 'Password123!',
    };

    it('should create a new organizer with valid data', () => {
      return request(app.getHttpServer())
        .post('/auth/signup')
        .send(validSignupDto)
        .expect(201)
        .expect((res: any) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty('email', 'test@example.com');
          expect(res.body).toHaveProperty('createdAt');
          expect(res.body).not.toHaveProperty('passwordHash');
        });
    });

    it('should return 400 for invalid email', () => {
      return request(app.getHttpServer())
        .post('/auth/signup')
        .send({
          email: 'invalid-email',
          password: 'Password123!',
        })
        .expect(400);
    });

    it('should return 400 for weak password', () => {
      return request(app.getHttpServer())
        .post('/auth/signup')
        .send({
          email: 'test2@example.com',
          password: 'weak',
        })
        .expect(400);
    });

    it('should return 409 for duplicate email', async () => {
      // First signup
      await request(app.getHttpServer())
        .post('/auth/signup')
        .send(validSignupDto)
        .expect(201);

      // Second signup with same email
      return request(app.getHttpServer())
        .post('/auth/signup')
        .send(validSignupDto)
        .expect(409);
    });
  });

  describe('/auth/login (POST)', () => {
    const signupDto: CreateOrganizerDto = {
      email: 'login-test@example.com',
      password: 'Password123!',
    };

    const loginDto: LoginDto = {
      email: 'login-test@example.com',
      password: 'Password123!',
    };

    beforeEach(async () => {
      // Create a user for login tests
      await request(app.getHttpServer()).post('/auth/signup').send(signupDto);
    });

    it('should login with valid credentials', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send(loginDto)
        .expect(200)
        .expect((res: any) => {
          expect(res.body).toHaveProperty('accessToken');
          expect(typeof res.body.accessToken).toBe('string');
        });
    });

    it('should return 401 for invalid email', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'Password123!',
        })
        .expect(401);
    });

    it('should return 401 for invalid password', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'login-test@example.com',
          password: 'WrongPassword123!',
        })
        .expect(401);
    });
  });

  describe('/auth/me (GET)', () => {
    const signupDto: CreateOrganizerDto = {
      email: 'me-test@example.com',
      password: 'Password123!',
    };

    let accessToken: string;

    beforeEach(async () => {
      // Create and login user
      await request(app.getHttpServer()).post('/auth/signup').send(signupDto);

      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: signupDto.email,
          password: signupDto.password,
        });

      accessToken = loginResponse.body.accessToken;
    });

    it('should return user profile with valid token', () => {
      return request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res: any) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty('email', 'me-test@example.com');
          expect(res.body).toHaveProperty('createdAt');
          expect(res.body).not.toHaveProperty('passwordHash');
        });
    });

    it('should return 401 without token', () => {
      return request(app.getHttpServer()).get('/auth/me').expect(401);
    });

    it('should return 401 with invalid token', () => {
      return request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });

  describe('Complete authentication flow', () => {
    const testUser: CreateOrganizerDto = {
      email: 'flow-test@example.com',
      password: 'Password123!',
    };

    it('should complete signup -> login -> access protected route flow', async () => {
      // Step 1: Signup
      const signupResponse = await request(app.getHttpServer())
        .post('/auth/signup')
        .send(testUser)
        .expect(201);

      expect(signupResponse.body).toHaveProperty('id');
      expect(signupResponse.body.email).toBe(testUser.email);

      // Step 2: Login
      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(200);

      expect(loginResponse.body).toHaveProperty('accessToken');
      const accessToken = loginResponse.body.accessToken;

      // Step 3: Access protected route
      const profileResponse = await request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(profileResponse.body.id).toBe(signupResponse.body.id);
      expect(profileResponse.body.email).toBe(testUser.email);
    });
  });
});
