import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  public async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new HttpException(
        'Wrong credentials provided',
        HttpStatus.BAD_REQUEST,
      );
    }
    const isPasswordCorrect = await this.verifyPassword(
      password,
      user.password,
    );
    if (!isPasswordCorrect) {
      return null;
    }
    return user;
  }

  public async verifyPassword(
    password: string,
    hash: string,
  ): Promise<boolean> {
    const isPasswordMatching = await bcrypt.compare(password, hash);
    if (!isPasswordMatching) {
      return false;
    }
    return true;
  }

  async login(user: User) {
    const payload = { sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
      id: user.id,
    };
  }

  async decodeToken(token: string) {
    return this.jwtService.decode(token) as { sub: string; iat: number };
  }
}
