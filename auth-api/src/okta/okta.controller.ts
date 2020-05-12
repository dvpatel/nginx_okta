import { HttpStatus, UseGuards, Controller, Headers, Res, Post, Logger } from '@nestjs/common';
import { OktaService } from './okta.service' ;
import { BasicProfile } from './basicprofile.model';
import { TokenValidationGuard } from 'src/util/token-validation.guard';

/**
 * Controller for /watchlist requests
 */
@Controller('validate')
export class OktaController {

  private readonly logger = new Logger(OktaController.name);

  public static readonly AUTHORIZATION: string = 'authorization';
  public static readonly BASIC_PROFILE_HEADER: string = 'X-Basic-Profile';
  public static readonly VALID_TOKEN: string = 'Valid Token';
  public static readonly INVALID_TOKEN: string = 'Invalid Token';
  public static readonly FORBIDDEN: string = 'Forbidden';

  /**
   * DI of service provider.
   * @param service
   */
  constructor(private readonly service: OktaService) { }

  /**
   * Validate OKTA Access Token
   */
  @Post()
  @UseGuards(new TokenValidationGuard())
  validateAccessToken(@Headers(OktaController.AUTHORIZATION) bearerToken: string, @Res() response): void {    
    this.service.introspect(bearerToken)
      .then((basicProfile: BasicProfile) => {
        if (!basicProfile.active) {
          response.status(HttpStatus.FORBIDDEN).send(OktaController.INVALID_TOKEN);
        } else {

          this.logger.debug(basicProfile);

          response.set(OktaController.BASIC_PROFILE_HEADER, JSON.stringify(basicProfile));
          response.status(HttpStatus.NO_CONTENT).send(OktaController.VALID_TOKEN);
        }
      })
      .catch((error) => {
        this.logger.error(error);
        response.status(HttpStatus.UNAUTHORIZED).send(OktaController.FORBIDDEN);
      }
    );
  }

}
