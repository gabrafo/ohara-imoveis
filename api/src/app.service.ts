import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getDefaultResponse(): string {
    return 'healthy';
  }
}
