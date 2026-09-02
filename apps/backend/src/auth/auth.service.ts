import { UserService } from '../user/user.service';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

const bcrypt = require('bcrypt') as typeof import('bcrypt');

@Injectable()
export class AuthService {
    constructor(
        private readonly userService: UserService,
        private readonly jwtService: JwtService,
    ) {}

    async signIn(username: string, password: string): Promise<{ access_token: string }> {
        const user = await this.userService.getUserByUsername(username);
        if (!user) throw new UnauthorizedException('Usuario no encontrado');

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) throw new UnauthorizedException('Contraseña incorrecta');

        const payload = { sub: user.id, username: user.username };
        return {
            access_token: await this.jwtService.signAsync(payload),
        };
    }
}