import { Inject, CACHE_MANAGER, Logger, HttpService, Injectable } from '@nestjs/common';
import { ConfigService } from '../config/config.service';
import { OktaConstant } from './okta.constant';
import { BasicProfile } from './basicprofile.model';
import { AxiosResponse } from 'axios';

import OktaJwtVerifier = require('@okta/jwt-verifier');

/**
 * Watch list management service.
 */
Injectable()
export class OktaService {

    private readonly logger = new Logger(OktaService.name);

    //  Okta access token url;
    public static readonly OKTA_URL_KEY: string = 'okta_url';
    public static readonly OKTA_ISSUER_KEY: string = 'okta_issuer';
    public static readonly OKTA_EXPECTED_AUD_KEY: string = 'okta_expected_aud';
    public static readonly OKTA_CLIENT_ID_KEY: string = 'okta_client_id';

    private oktaJwtVerifier: OktaJwtVerifier;
    private expectedAud: string;

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
     * Promise wrap basic profile from Okta introspect end-point
     * @param accessToken 
     */
    private getBasicProfile(accessToken: string): Promise<BasicProfile> {

        //  Nothing in cache, get basic profile from Okta
        this.logger.debug('Getting basic profile from Okta introspect endpoint.');
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

    /**
     * Initialize JwtVerifier for local access token validation
     */
    private getJwtVerifier(): OktaJwtVerifier {
        if (!this.oktaJwtVerifier) {

            this.logger.debug('Initializing JwtVerifier');

            this.expectedAud = this.configService.get(OktaService.OKTA_EXPECTED_AUD_KEY);
            this.oktaJwtVerifier = new OktaJwtVerifier({
                issuer: this.configService.get(OktaService.OKTA_ISSUER_KEY),
                clientId: this.configService.get(OktaService.OKTA_CLIENT_ID_KEY),
                jwksRequestsPerMinute: 10,
                assertClaims: {
                    'groups.includes': ['Everyone']
                }
            });
        }

        return this.oktaJwtVerifier;
    }

    /**
     * Promise wrap basic profile from JWT Verifier
     * @param accessToken 
     */
    private async getBasicProfileFromJwtVerifier(accessToken: string): Promise<BasicProfile> {

        this.logger.debug('Getting basic profile from Okta JWT Verifier.');
        return this.getJwtVerifier().verifyAccessToken(accessToken, this.expectedAud)
            .then(jwt => {
                // the token is valid
                var basicProfile = new BasicProfile(jwt.claims);
                this.cacheManager.set(accessToken, basicProfile);
                return new Promise<BasicProfile>(function (resolve, reject) {
                    resolve(basicProfile);
                });
            })
            .catch(err => {
                throw err;
            });

    }
}
