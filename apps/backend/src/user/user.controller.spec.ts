import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { PrismaService } from '../prisma/prisma.service';
import { clearTestDatabase, seedTestDatabase, TestData } from '../../test/test-data';
import { PrismaExceptionFilter } from '../prisma/prisma-exception.filter';

const bcrypt = require('bcrypt') as typeof import('bcrypt');
const request = require('supertest');

describe('UserController', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let testData: TestData;

  beforeAll(async () => {
      const module: TestingModule = await Test.createTestingModule({
        controllers: [UserController],
        providers: [UserService, PrismaService],
      }).compile();
  
      app = module.createNestApplication();
      app.useGlobalFilters(new PrismaExceptionFilter());
      await app.init();
  
      prisma = module.get<PrismaService>(PrismaService);
      testData = await seedTestDatabase(prisma);
  
    });

  afterAll(async () => {
    await clearTestDatabase(prisma);
    await app.close();
  });  

  describe('PUT /user/:id', () => {
    it('should return a 200 and the updated user', async () => {
      const data = {
        username:"user1Updated"
      }
      await request(app.getHttpServer())
      .put(`/user/${testData.user1.id}`)
      .send(data)
      .expect(200)

      const user = await prisma.user.findUniqueOrThrow({
        where: {id: testData.user1.id }
      });

      expect(user.username).toBe(data.username)
      expect(user.password).toBe(testData.user1.password)
    });
    it('should return a 404 if the user does not exist', async () => {
      const data = {
        username: "userUpdated"
      }
      await request(app.getHttpServer())
        .put(`/user/9999`)
        .send(data)
        .expect(404);
    })
  })

  describe('PUT /user/:id/password', () => {
    it('should return a 200 after updating the password', async () => {
      const data = {
        newPassword: "newPassword",
        oldPassword: "password"
      }

      await request(app.getHttpServer())
        .put(`/user/${testData.user2.id}/password`)
        .send(data)
        .expect(200)
      

      const user = await prisma.user.findUniqueOrThrow({
        where: {id: testData.user2.id }
      });

      expect(user.username).toBe(testData.user2.username)
      expect(await bcrypt.compare(data.newPassword, user.password)).toBe(true)

    })

    it('should return a 404 if the user does not exist ', async () => {
      const data = {
        newPassword: "newPassword",
        oldPassword: "password"
      }

      await request(app.getHttpServer())
        .put(`/user/99999/password`)
        .send(data)
        .expect(404)
    })
    it('should return a 400 if the old password is not the same', async () => {
      const data = {
        newPassword: "newPassword",
        oldPassword: "wrongPassword"
      }

      await request(app.getHttpServer())
        .put(`/user/${testData.user2.id}/password`)
        .send(data)
        .expect(401)
    })
  })
});
