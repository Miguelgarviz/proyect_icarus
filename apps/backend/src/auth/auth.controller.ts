import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  UnauthorizedException,
  UseGuards
} from '@nestjs/common';
import { AuthGuard } from './auth.guard.js';
import { AuthService } from './auth.service.js';
import { UserService } from '../user/user.service.js';
import { JwtService } from '@nestjs/jwt';
import { Public } from './decorators/public.decorator.js';

const bcrypt = require('bcrypt') as typeof import('bcrypt');

@Public()
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly jwtService: JwtService
) {}
  
  @HttpCode(201)
  @Post('/register')
  async register(@Body() registerDto: {username: string, password: string }) {
    return await this.userService.createUser(registerDto.username,registerDto.password)
  }

  @HttpCode(201)
  @Post('/login')
  async login(@Body() logInDto: { username: string; password: string }) {
    const token = await this.authService.signIn(logInDto.username, logInDto.password)
    return token;
  }
}
