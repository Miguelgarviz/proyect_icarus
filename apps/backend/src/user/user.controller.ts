import { Body, Controller, Put, Param, Post} from '@nestjs/common';
import { UserService } from './user.service';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, User } from '@backend/generated/prisma/browser';

const bcrypt = require('bcrypt') as typeof import('bcrypt');

@Controller('user')
export class UserController {
    constructor(
        private readonly prisma: PrismaService,
        private readonly userService: UserService
    ){}

    @Put('/:id')
    async updateUserData(
        @Param('id') id: string,
        @Body() username: string,
    ): Promise<User> {
        return this.userService.updateUser(Number(id), { username });
    }

    @Put('/:id/password')
    async updateUserPassword(@Param('id') id: string, @Body() passwordData:  { newPassword: string, oldPassword: string}){
        const user = await this.userService.getUser(Number(id));
        
        const valid = await bcrypt.compare(passwordData.oldPassword, user.password);
        if(!valid) throw new Error('Contraseña incorrecta');

        return this.userService.updateUserPassword(Number(id), passwordData.newPassword);
    }

    
}
