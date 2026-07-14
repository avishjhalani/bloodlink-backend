import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractToken(request);

    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET || 'bloodlink_secret_2026'
      });
      request['user'] = payload;
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }

    return true;
  }

  private extractToken(request: any): string | null {
    // 1. Try to extract from Authorization header
    const authHeader = request.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.split(' ')[1];
    }
    // 2. Try to extract from Cookie header
    const cookieHeader = request.headers['cookie'];
    if (cookieHeader) {
      const cookies = cookieHeader.split(';').reduce((acc: any, c: string) => {
        const [name, val] = c.trim().split('=');
        if (name && val) acc[name] = val;
        return acc;
      }, {});
      if (cookies['token']) {
        return cookies['token'];
      }
    }
    return null;
  }
}