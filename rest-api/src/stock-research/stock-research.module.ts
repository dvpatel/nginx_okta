import { Module, HttpModule } from '@nestjs/common';
import { ConfigModule } from '../config/config.module';

import { StockResearchController } from './stock-research.controller';
import { StockResearchService } from './stock-research.service';

/**
 * Registration object.
 */
@Module({
    imports: [
        HttpModule.register({ timeout: 2000, maxRedirects: 1 }),
        ConfigModule],
    controllers: [
        StockResearchController],
    providers: [
        StockResearchService],
})
export class StockResearchModule { }
