import { Module, HttpModule } from '@nestjs/common';
import { ConfigModule } from './config/config.module';

import { AuthenticationGuard } from './util/authentication.guard' ;
import { HealthController } from './health/health.controller';
import { StockResearchModule } from './stock-research/stock-research.module';
import { WatchListModule} from './watchlist/watch-list.module' ;

/**
 * Register application and dependent objects.
 */
@Module({
  providers: [AuthenticationGuard],
  imports: [
    ConfigModule,
    StockResearchModule,
    WatchListModule],
  controllers: [ HealthController ],
})
export class AppModule { }
