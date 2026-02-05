import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, HttpStatus } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { SignupDto } from '../src/auth/dto/signup-dto';
import { DataSource } from 'typeorm';

describe('Transactions (e2e)', () => {
  let app: INestApplication;
  let authToken: string;
  let userId: string;

  const signupDto: SignupDto = {
    email: `txn-test-${Date.now()}@example.com`,
    password: 'Password123##',
    first_name: 'Txn',
    last_name: 'Tester',
    phone_number: {
      country_code: '+234',
      phone: '0987654321',
    },
  };

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Register user
    const regResponse = await request(app.getHttpServer())
      .post('/v1/auth/register')
      .send(signupDto);

    if (regResponse.status !== 201 && regResponse.status !== 409) {
      throw new Error(
        `Failed to register user: ${JSON.stringify(regResponse.body)}`,
      );
    }

    const dataSource = app.get(DataSource);
    const users = await dataSource.query(
      `SELECT user_id FROM users WHERE email = $1`,
      [signupDto.email],
    );
    userId = users[0]?.user_id;

    // Direct DB verification
    await dataSource.query(
      `UPDATE users SET is_email_verified = true, status = 'active' WHERE user_id = $1`,
      [userId],
    );

    // Sign in to get token
    const signinResponse = await request(app.getHttpServer())
      .post('/v1/auth/signin')
      .send({ email: signupDto.email, password: signupDto.password });

    authToken = signinResponse.body.response.token;

    // Generate some transactions
    await request(app.getHttpServer())
      .post('/v1/wallets/fund')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ amount: 100000, currency: 'NGN' });

    await request(app.getHttpServer())
      .post('/v1/wallets/convert')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        from_currency: 'NGN',
        to_currency: 'USD',
        amount: 20000,
      });
  }, 30000);

  afterAll(async () => {
    await app.close();
  });

  it('/v1/transactions (GET)', async () => {
    const response = await request(app.getHttpServer())
      .get('/v1/transactions')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(HttpStatus.OK);

    expect(response.body.response).toHaveProperty('docs');
    expect(response.body.response).toHaveProperty('pagination');
    expect(Array.isArray(response.body.response.docs)).toBe(true);
    expect(response.body.response.docs.length).toBeGreaterThan(0);
  });

  it('/v1/transactions/:transaction_id (GET)', async () => {
    // First get all transactions to find an ID
    const listResponse = await request(app.getHttpServer())
      .get('/v1/transactions')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(HttpStatus.OK);

    const txnId = listResponse.body.response.docs[0].transaction_id;

    const response = await request(app.getHttpServer())
      .get(`/v1/transactions/${txnId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(HttpStatus.OK);

    expect(response.body.response).toHaveProperty('transaction_id', txnId);
    expect(response.body.response).toHaveProperty('amount');
    expect(response.body.response).toHaveProperty('currency');
  });

  it('/v1/transactions (GET) - with filters', async () => {
    const response = await request(app.getHttpServer())
      .get('/v1/transactions')
      .set('Authorization', `Bearer ${authToken}`)
      .query({ type: 'funding' })
      .expect(HttpStatus.OK);

    expect(
      response.body.response.docs.every((t: any) => t.type === 'funding'),
    ).toBe(true);
  });
});
