import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealthz(): { message: string } {
    return { message: 'The application is working fine' };
  }
}
