import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, HttpStatus } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('Countries (e2e)', () => {
  let app: INestApplication;

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

  it('/v1/fx/countries (GET)', async () => {
    const response = await request(app.getHttpServer())
      .get('/v1/fx/countries')
      .expect(HttpStatus.OK);

    expect(response.body.response).toHaveProperty('docs');
    expect(response.body.response).toHaveProperty('pagination');
    expect(Array.isArray(response.body.response.docs)).toBe(true);
    expect(response.body.response.docs.length).toBeGreaterThan(0);
  });

  it('/v1/fx/countries/:id (GET)', async () => {
    // First get all countries to find an ID
    const listResponse = await request(app.getHttpServer())
      .get('/v1/fx/countries')
      .expect(HttpStatus.OK);

    const countryId = listResponse.body.response.docs[0].id;

    const response = await request(app.getHttpServer())
      .get(`/v1/fx/countries/${countryId}`)
      .expect(HttpStatus.OK);

    expect(response.body.response).toHaveProperty('id', countryId);
    expect(response.body.response).toHaveProperty('country');
    expect(response.body.response).toHaveProperty('currency_code');
  });

  it('/v1/fx/rates (GET)', async () => {
    const response = await request(app.getHttpServer())
      .get('/v1/fx/rates')
      .query({ base: 'USD' })
      .expect(HttpStatus.OK);

    expect(response.body.response).toBeDefined();
    expect(typeof response.body.response).toBe('object');
    // It should have some rates, e.g., NGN or others seeded
    const rates = response.body.response;
    const currencies = Object.keys(rates);
    expect(currencies.length).toBeGreaterThan(0);
  });
});
