import { Body, Controller, Header, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginRequestDto } from './dto/request/login.request.dto';
import { RegisterRequestDto } from 'src/auth/dto/request/register.request.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() body: LoginRequestDto){
    return await this.authService.login(body);
  }

  @Post('register')
  async register(@Body() body: RegisterRequestDto) {
    return this.authService.register(body);
  }

  @Post('forgot-password')
  async forgotPassword(@Body('email') email: string){
    return this.authService.forgotPassword(email);
  }

  /*@Post('reset-password')
  async resetPassword(
    @Body('token') token: string,
    @Body('newPassword') newPassword: string
  ){
    return this.authService.resetPassword(token, newPassword);
  }*/
}
