import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, Length } from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({
    description: 'User email adress',
    required: false,
    type: String,
  })
  @IsOptional()
  @IsEmail()
  email: string;
}
