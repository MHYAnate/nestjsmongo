import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const exists = await this.usersService.findByEmail(dto.email);
    if (exists) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = await this.usersService.create(dto.name, dto.email, hashedPassword);

    const token = this.jwtService.sign(
      { sub: user._id.toString(), email: user.email },
      { secret: this.configService.get<string>('JWT_SECRET') }
    );

    return {
      access_token: token,
      user: { id: user._id, name: user.name, email: user.email },
    };
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isValid = await bcrypt.compare(dto.password, user.password);
    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = this.jwtService.sign(
      { sub: user._id.toString(), email: user.email },
      { secret: this.configService.get<string>('JWT_SECRET') }
    );

    return {
      access_token: token,
      user: { id: user._id, name: user.name, email: user.email },
    };
  }
}