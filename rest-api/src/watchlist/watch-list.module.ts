import { Module, HttpModule } from '@nestjs/common';
import { ConfigModule } from '../config/config.module';

import { WatchListController} from './watch-list.controller' ;
import { WatchListService } from './watch-list.service' ;
import { SamplesBuilder } from './samples-builder' ;

/**
 * Registration object.
 */
@Module({
    controllers: [
        WatchListController],
    providers: [
        WatchListService, SamplesBuilder],
})
export class WatchListModule { }
