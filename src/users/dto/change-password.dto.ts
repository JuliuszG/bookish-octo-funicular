import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, Length } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({
    description: 'New password',
    required: true,
    type: String,
  })
  @IsNotEmpty()
  @Length(6, 32)
  newPassword: string;

  @ApiProperty({
    description: 'Old password',
    required: true,
    type: String,
  })
  @IsNotEmpty()
  @Length(6, 32)
  oldPassword: string;
}
