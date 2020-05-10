import { Module, HttpModule } from '@nestjs/common';

import { ConfigModule } from './config/config.module';
import { HealthController } from './health/health.controller';
import { OktaModule} from './okta/okta.module' ;

/**
 * Register application and dependent objects.
 */
@Module({
  imports: [
    ConfigModule,
    OktaModule],
  controllers: [ HealthController ],
})
export class AppModule {}
