import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, HttpStatus } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { SignupDto } from '../src/auth/dto/signup-dto';

describe('UserController (e2e)', () => {
  let app: INestApplication;

  const signupDto: SignupDto = {
    email: `test-user-${Date.now()}@example.com`,
    password: 'Password123##',
    confirm_password: 'Password123##',
    first_name: 'Test',
    last_name: 'User',
    phone_number: {
      country_code: '+234',
      phone: '1234567890',
    },
    gender: 'male',
  } as any;

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  }, 30000);

  afterAll(async () => {
    await app.close();
  });

  it('/v1/auth/register (POST) - should create a new user', async () => {
    const response = await request(app.getHttpServer())
      .post('/v1/auth/register')
      .send(signupDto)
      .expect(HttpStatus.CREATED);

    expect(response.body.response).toHaveProperty('user_id');
    expect(response.body.response.email).toBe(signupDto.email);
  });

  it('/v1/auth/register (POST) - should return conflict if user already exists', async () => {
    const response = await request(app.getHttpServer())
      .post('/v1/auth/register')
      .send(signupDto)
      .expect(HttpStatus.CONFLICT);

    expect(response.body.message).toBe('User already exists');
  });
});
