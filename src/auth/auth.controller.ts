import { Body, Controller, Post, Get, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { SignupDto } from './dto/signup.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  @ApiOperation({ summary: 'Sign up a new user' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  signup(@Body() dto: SignupDto) {
    return this.authService.signup(dto.email, dto.password);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto.email, dto.password);
  }

  @Get('who')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current authenticated user details with profile' })
  @ApiResponse({ 
    status: 200, 
    description: 'User details with profile information',
    schema: {
      example: {
        id: 'user-uuid',
        email: 'doctor@example.com',
        roles: ['doctor'],
        isSuperAdmin: false,
        profile: {
          type: 'doctor',
          id: 'profile-uuid',
          firstName: 'John',
          lastName: 'Doe',
          email: 'doctor@example.com',
          phone: '+1234567890',
          specialization: 'Orthopedics',
          licenseNumber: 'DOC-12345',
          status: 'active',
          // ... other profile fields
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  who(@Request() req) {
    return this.authService.getAuthenticatedUserDetails(req.user.userId);
  }
}
