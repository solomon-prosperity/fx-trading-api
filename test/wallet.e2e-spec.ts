import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, HttpStatus } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { SignupDto } from '../src/auth/dto/signup-dto';
import { TradeAction } from '../src/wallets/dto/trade-currency.dto';
import { DataSource } from 'typeorm';

describe('Wallet (e2e)', () => {
  let app: INestApplication;
  let authToken: string;

  const signupDto: SignupDto = {
    email: `wallet-test-${Date.now()}@example.com`,
    password: 'Password123##',
    first_name: 'Wallet',
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
    const userId = users[0]?.user_id;

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
  }, 30000);

  afterAll(async () => {
    await app.close();
  });

  it('/v1/wallets/fund (POST) - should fund NGN wallet', async () => {
    const response = await request(app.getHttpServer())
      .post('/v1/wallets/fund')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ amount: 5000000, currency: 'NGN' }) // 50,000.00 NGN
      .expect(HttpStatus.OK);

    expect(response.body.response).toHaveProperty('amount', 5000000);
    expect(response.body.response).toHaveProperty('currency', 'NGN');
  });

  it('/v1/wallets/convert (POST) - should convert NGN to USD', async () => {
    const response = await request(app.getHttpServer())
      .post('/v1/wallets/convert')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        from_currency: 'NGN',
        to_currency: 'USD',
        amount: 50000, // 500.00 NGN
      })
      .expect(HttpStatus.OK);

    expect(response.body.response).toHaveProperty('debit_transaction');
    expect(response.body.response).toHaveProperty('credit_transaction');
    expect(response.body.response.credit_transaction).toHaveProperty(
      'currency',
      'USD',
    );
  });

  it('/v1/wallets/trade (POST) - should execute a BUY trade (NGN to USD)', async () => {
    const response = await request(app.getHttpServer())
      .post('/v1/wallets/trade')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        base_currency: 'USD',
        quote_currency: 'NGN',
        amount: 1000, // Buy 10.00 USD
        action: TradeAction.BUY,
      })
      .expect(HttpStatus.OK);

    expect(response.body.response).toHaveProperty('debit_transaction');
    expect(response.body.response).toHaveProperty('credit_transaction');
    expect(response.body.response.action).toBe(TradeAction.BUY);
  });

  it('/v1/wallets (GET) - should retrieve wallets', async () => {
    const response = await request(app.getHttpServer())
      .get('/v1/wallets')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(HttpStatus.OK);

    expect(Array.isArray(response.body.response)).toBe(true);
    const ngnWallet = response.body.response.find(
      (w: any) => w.currency === 'NGN',
    );
    expect(ngnWallet).toBeDefined();
  });
});
