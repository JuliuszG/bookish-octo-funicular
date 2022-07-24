import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  DefaultValuePipe,
  ParseIntPipe,
  Query,
  UseInterceptors,
  ClassSerializerInterceptor,
  Req,
  UseGuards,
  UploadedFile,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Pagination } from 'nestjs-typeorm-paginate';
import { User } from './entities/user.entity';
import {
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import { ChangePasswordDto } from './dto/change-password.dto';
import { Public } from 'src/decorators/public.decorator';
import { OwnAccountGuard } from 'src/auth/guards/own-account.guard';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('Users Module')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseInterceptors(ClassSerializerInterceptor)
  @Post()
  @Public()
  @UseInterceptors(FileInterceptor('file'))
  @ApiResponse({
    status: 200,
    description: 'A user has been successfully created',
    type: User,
  })
  create(
    @Body() createUserDto: CreateUserDto,
    @UploadedFile() file: Express.Multer.File = null,
  ) {
    console.log(createUserDto);
    console.log(file);
    return this.usersService.create(createUserDto, file);
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Get()
  @ApiBearerAuth('access-token')
  @ApiResponse({
    status: 200,
    description: 'Users have been found',
    schema: {
      allOf: [
        {
          properties: {
            results: {
              type: 'array',
              items: { $ref: getSchemaPath(User) },
            },
          },
        },
      ],
    },
  })
  @ApiQuery({
    name: 'page',
    description: 'Specific page of all users list',
  })
  @ApiQuery({
    name: 'limit',
    description: 'Limit results on the users list',
  })
  async getAllUsers(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number = 10,
  ): Promise<Pagination<User>> {
    limit = limit > 100 ? 100 : limit;
    return this.usersService.paginate({
      page,
      limit,
      route: '/users',
    });
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Get('findByEmail/:email')
  @ApiBearerAuth('access-token')
  @ApiResponse({
    status: 200,
    description: 'User with specified email have been found',
    type: User,
  })
  @ApiParam({
    name: 'email',
    required: true,
    description: 'Should be an email of a user that exists in the database',
    type: String,
  })
  findByEmail(@Param('email') email: string) {
    return this.usersService.findByEmail(email);
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Get('findById/:id')
  @ApiBearerAuth('access-token')
  @ApiResponse({
    status: 200,
    description: 'User with specified id have been found',
    type: User,
  })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'Should be an id of a user that exists in the database',
    type: String,
  })
  findById(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @ApiBearerAuth('access-token')
  @ApiResponse({
    status: 200,
    description: 'User with specified id have been updated',
    type: User,
  })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'Should be an id of a user that exists in the database',
    type: String,
  })
  @UseGuards(OwnAccountGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @ApiBearerAuth('access-token')
  @ApiResponse({
    status: 200,
    description: 'Change user password. Requires old password',
    type: User,
  })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'Should be an id of a user that exists in the database',
    type: String,
  })
  @ApiBearerAuth('access-token')
  @UseGuards(OwnAccountGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @Patch('change-password/:id')
  changePassword(
    @Param('id') id: string,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.usersService.changePassword(id, changePasswordDto);
  }

  @ApiBearerAuth('access-token')
  @ApiResponse({
    status: 200,
    description: 'User with specified id have been removed',
    type: User,
  })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'Should be an id of a user that exists in the database',
    type: String,
  })
  @UseInterceptors(ClassSerializerInterceptor)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
