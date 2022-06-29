import { ApiProperty } from '@nestjs/swagger';

export class LoginResponseDto {
  @ApiProperty()
  access_token: string;
  @ApiProperty()
  username: string;
  @ApiProperty()
  id: string;
}
