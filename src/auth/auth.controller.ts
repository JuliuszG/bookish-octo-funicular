import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiExtraModels,
  ApiParam,
  ApiResponse,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import { Public } from 'src/decorators/public.decorator';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import RequestWithUser from './interfaces/requestWithUser.interface';
import { LoginResponseDto } from './dtos/login-response.dto';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';
import { Request } from 'express';
import { CurrentUser } from 'src/decorators/current-user.decorator';

@ApiTags('Auth Module')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @ApiExtraModels(LoginResponseDto)
  @ApiResponse({
    status: 200,
    description: 'A user has been successfully signed in',
    schema: {
      $ref: getSchemaPath(LoginResponseDto),
    },
  })
  @UseInterceptors(ClassSerializerInterceptor)
  @HttpCode(200)
  @UseGuards(LocalAuthGuard)
  @Public()
  @Post('signin')
  async signIn(@Req() request: RequestWithUser) {
    return this.authService.login(request.user);
  }

  @ApiResponse({
    status: 200,
    description: 'User with specified id have been removed',
    type: User,
  })
  @UseInterceptors(ClassSerializerInterceptor)
  @Get('current-user')
  async getCurrentUser(@Req() request: Request) {
    const authHeader = request.headers.authorization.substring(
      7,
      request.headers.authorization.length,
    );
    const decodedToken = await this.authService.decodeToken(authHeader);
    return this.usersService.findById(decodedToken.sub);
  }
}
