import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ForgotPasswordUserDto,
  LoginDto,
  RequestForgotPassword,
} from './dto/auth.dto';
import { UsersService } from 'src/user/user.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from 'src/user/dto/user.dto';
import * as crypto from 'crypto';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class AuthService {
  constructor(
    protected userService: UsersService,
    private readonly jwtService: JwtService,
    private readonly mailerService: MailerService,
  ) {}

  async login(loginDto: LoginDto) {
    const { username, password } = loginDto;
    const user = await this.validateUser(username, password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { username: user.username, sub: user._id.toString() };
    return {
      username: user.username,
      fullname: user.fullname,
      role: user.role,
      access_token: this.jwtService.sign(payload),
    };
  }

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.userService.findOneByUsername(username);
    const deceodePassowrdBase64 = Buffer.from(password!, 'base64').toString(
      'utf-8',
    );
    if (user && (await bcrypt.compare(deceodePassowrdBase64, user.password))) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = user.toObject();
      return result;
    }
    return null;
  }

  async register(userDto: CreateUserDto) {
    return await this.userService.create(userDto);
  }

  async remove(id: string) {
    return await this.userService.remove(id);
  }

  generateResetToken(): string {
    return crypto.randomBytes(3).toString('hex');
  }

  async forgotPassword(requestForgotPassword: RequestForgotPassword) {
    const { email } = requestForgotPassword;
    const user = await this.userService.findOneByEmail(email);

    if (!user) {
      throw new InternalServerErrorException('Oops something wrong');
    }

    const resetToken = this.generateResetToken();
    const resetTokenExpiry = new Date();
    resetTokenExpiry.setHours(resetTokenExpiry.getHours() + 1);

    user.resetToken = resetToken;
    user.resetTokenExpiry = resetTokenExpiry;
    await user.save();

    const resetLink = `http://localhost:3000/reset-password?token=${resetToken}`;

    // nanti ganti menggunakan template yang akan tersedia di DB templates collection
    const emailContent = `
      <h1>Password Reset Request</h1>
      <p>Hello ${user.fullname},</p>
      <p>We received a request to reset your password.</p>
      <p>Click the link below to reset your password:</p>
      <a href="${resetLink}">Reset Password</a>
      <p>This link will expire in 1 hour.</p>
    `;

    try {
      const sendmail = await this.mailerService.sendMail({
        to: email,
        subject: 'Password Reset Request',
        html: emailContent,
      });
      console.log(sendmail);
      return { message: 'Reset link sent to your email address.' };
    } catch (error) {
      console.error('Error sending email:', error.message);
      throw new InternalServerErrorException('Failed to send reset email.');
    }
  }

  async resetPassword(forgotPasswordUser: ForgotPasswordUserDto) {
    return this.userService.resetPassword(forgotPasswordUser);
  }
}
