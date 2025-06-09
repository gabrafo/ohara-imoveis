import { Controller, Post } from '@nestjs/common';

@Controller('auth')
export class AuthController {
  @Post('login')
  login(): { message: string } {
    return { message: 'Login successful' };
  }
}
