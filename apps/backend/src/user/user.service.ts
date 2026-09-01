import { User } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { Injectable } from '@nestjs/common';

const bcrypt = require('bcrypt') as typeof import('bcrypt');

@Injectable()
export class UserService {
    constructor(
        private prisma: PrismaService
    ){}

    async getUser(userId: number) {
        return await this.prisma.user.findUniqueOrThrow({
            where: {
                id: userId
            }
        });
    }
    
    async getUserByUsername(username: string){
        return await this.prisma.user.findUniqueOrThrow({
            where:{
                username: username
            }
        })
    }

    async createUser(username: string, password: string) {
        const hash = await bcrypt.hash(password, 10);
        const user = await this.prisma.user.create({
            data: { 
                username: username,
                password: hash 
            }
        });
        return user;
    }
}
