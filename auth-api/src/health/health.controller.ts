import { Controller, Get } from '@nestjs/common';

/**
 * Simple health check controller
 */
@Controller('health')
export class HealthController {

  /**
   * ping.
   */
  @Get()
  getStatus(): string {
    return 'up';
  }
}
