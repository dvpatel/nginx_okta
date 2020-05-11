import { Injectable, Logger } from '@nestjs/common';
import { stringify } from 'querystring';
import { ConfigService } from '../config/config.service';

/**
 * Watch list management service.
 */
@Injectable()
export class OktaConstant {

    private static readonly logger = new Logger(OktaConstant.name);

    public static readonly CLIENT_ID_KEY: string = 'okta_client_id';
    public static readonly CLIENT_SECRET_KEY: string = 'okta_client_secret';
    public static readonly TOKEN_TYPE_KEY: string = 'okta_token_type_hint';

    /**
     * Build input params for Okta access token service
     * @param configService 
     * @param accessToken 
     */
    public static oktaBuildParams(configService: ConfigService, accessToken: string): string {
        var config = stringify({
            client_id: configService.get(OktaConstant.CLIENT_ID_KEY),
            client_secret: configService.get(OktaConstant.CLIENT_SECRET_KEY),
            token_type_hint: configService.get(OktaConstant.TOKEN_TYPE_KEY),
            token: accessToken
        });

        OktaConstant.logger.verbose('OktaConfig:  ' + config);

        return config;
    }
}
