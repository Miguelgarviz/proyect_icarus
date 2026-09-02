
import { Module } from '@nestjs/common';
import { UserService } from './user.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { UserController } from './user.controller';

@Module({
  providers: [UserService, PrismaService],
  exports: [UserService],
  controllers: [UserController],
})
export class UserModule {}
