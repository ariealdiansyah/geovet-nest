import {
  Controller,
  Post,
  Body,
  Param,
  Delete,
  ValidationPipe,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  ForgotPasswordUserDto,
  LoginDto,
  RequestForgotPassword,
} from './dto/auth.dto';
import { CreateUserDto } from 'src/user/dto/user.dto';
import { RolesGuard } from 'src/roles-guard/roles.guard';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('register')
  async register(@Body(new ValidationPipe()) createUserDto: CreateUserDto) {
    return await this.authService.register(createUserDto);
  }

  @Post('forgot-password')
  async forgotPassword(@Body() requestForgotPassword: RequestForgotPassword) {
    console.log('masuk reset', requestForgotPassword);
    return this.authService.forgotPassword(requestForgotPassword);
  }

  @Post('validate-new-password')
  async validateForgotPassword(
    @Body() forgotPasswordUser: ForgotPasswordUserDto,
  ) {
    console.log('masuk validate', forgotPasswordUser);
    return this.authService.resetPassword(forgotPasswordUser);
  }

  @Delete('delete-account/:id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  async remove(@Param('id') id: string) {
    return await this.authService.remove(id);
  }
}
