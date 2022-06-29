import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import {
  IPaginationOptions,
  Pagination,
  paginate,
} from 'nestjs-typeorm-paginate';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
  ) {}
  async create(createUserDto: CreateUserDto): Promise<User> {
    const { email, password } = createUserDto;
    const checkIfExists = await this.findByEmail(email);
    if (checkIfExists) {
      throw new HttpException('User already exists', HttpStatus.FORBIDDEN);
    }
    const hash = await bcrypt.hash(password, 10);
    const newUser = this.usersRepository.create({
      email,
      password: hash,
    });
    return this.usersRepository.save(newUser);
  }

  async paginate(options: IPaginationOptions): Promise<Pagination<User>> {
    const queryBuilder = this.usersRepository.createQueryBuilder('user');
    queryBuilder.orderBy('user.id', 'DESC');
    return paginate<User>(queryBuilder, options);
  }

  async findByEmail(email: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: {
        email,
      },
    });
    return user;
  }

  async findById(id: string): Promise<User> {
    if (!id) {
      throw new BadRequestException();
    }
    const user = await this.usersRepository.findOne({
      where: {
        id,
      },
    });
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findById(id);
    if (!user) {
      throw new HttpException(
        'User with specified id does not exists',
        HttpStatus.NOT_FOUND,
      );
    }
    const newUser = Object.assign(user, updateUserDto);
    return this.usersRepository.save(newUser);
  }

  async remove(id: string): Promise<{ message: string }> {
    const user = await this.findById(id);
    if (!user) {
      throw new HttpException(
        'User with specified id does not exists',
        HttpStatus.NOT_FOUND,
      );
    }
    await this.usersRepository.delete(id);
    return {
      message: 'User with id ' + id + ' was deleted',
    };
  }

  async changePassword(id: string, changePasswordDto: ChangePasswordDto) {
    const { oldPassword, newPassword } = changePasswordDto;
    const user = await this.findById(id);
    if (!user) {
      throw new HttpException(
        'User with specified id does not exists',
        HttpStatus.NOT_FOUND,
      );
    }
    const isPasswordMatching = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordMatching) {
      throw new HttpException(
        'Old password doesnt match',
        HttpStatus.NOT_FOUND,
      );
    }
    const hash = await bcrypt.hash(newPassword, 10);
    const updatedUser = Object.assign(user, {
      password: hash,
    });

    return this.usersRepository.save(updatedUser);
  }
}
