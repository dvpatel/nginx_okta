import { CacheModule, Module, HttpModule } from '@nestjs/common';
import { ConfigModule } from '../config/config.module';
import { OktaController} from './okta.controller' ;
import { OktaService } from './okta.service' ;
import { TokenValidationGuard } from 'src/util/token-validation.guard';

/**
 * Registration object.
 */
@Module({
    imports: [
        CacheModule.register({
            ttl: 600, // seconds
            max: 10, // maximum number of items in cache
        }),
        HttpModule.register({ timeout: 2000, maxRedirects: 0 }),
        ConfigModule
    ],
    controllers: [OktaController],
    providers: [TokenValidationGuard, OktaService]
})
export class OktaModule { }
