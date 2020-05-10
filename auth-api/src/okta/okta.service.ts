import { Inject, CACHE_MANAGER, Logger, HttpService, Injectable } from '@nestjs/common';
import { ConfigService } from '../config/config.service';
import { OktaConstant } from './okta.constant';
import { BasicProfile } from './basicprofile.model';
import { AxiosResponse } from 'axios';

/**
 * Watch list management service.
 */
Injectable()
export class OktaService {

    private readonly logger = new Logger(OktaService.name);

    //  Okta access token url;
    public static readonly OKTA_URL_KEY: string = 'okta_url';

    /**
     * Init (real) service with external dependencies
     * @param config Configuration object
     * @param http HttpUtil
     */
    constructor(private http: HttpService, @Inject(CACHE_MANAGER) private cacheManager: any, private configService: ConfigService) {
        this.logger.verbose('Init Okta service.');
    }

    /**
     * Emulate customer.  Get customer's watch list by Id
     * @param customerId
     * @param watchListId
     */
    public async introspect(bearerToken: string): Promise<BasicProfile> {
        var accessToken = (bearerToken || 'no: token').trim().split(' ')[1];

        //  First check for (memory) cached basic profile;
        const cachedBasicProfile = await this.cacheManager.get(accessToken);
        return (cachedBasicProfile) ?
            this.getCachedBasicProfile(cachedBasicProfile) :
            this.getBasicProfile(accessToken);

    }

    /**
     * Promise wrap basic profile from cache
     * @param cachedBasicProfile
     */
    private getCachedBasicProfile(cachedBasicProfile: BasicProfile): Promise<BasicProfile> {
        //  Return basic profile from memory cache
        return new Promise<BasicProfile>(function (resolve, reject) {
            resolve(cachedBasicProfile);
        });
    }

    /**
     * Promise wrap basic profile from Okta
     * @param accessToken 
     */
    private getBasicProfile(accessToken: string): Promise<BasicProfile> {

        //  Nothing in cache, get basic profile from Okta
        this.logger.debug('Getting basic profile from Okta.');
        return this.http.post<BasicProfile>(
            this.configService.get(OktaService.OKTA_URL_KEY),
            OktaConstant.oktaBuildParams(this.configService, accessToken)
        )
            .toPromise()
            .then((response: AxiosResponse<BasicProfile>) => {
                this.cacheManager.set(accessToken, response.data);
                this.logger.verbose('BasicProfile:  ' + JSON.stringify(response.data));
                return response.data;
            })
            .catch((error) => {
                throw error;
            });

    }
}
