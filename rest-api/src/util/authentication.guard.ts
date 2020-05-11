import { Logger, Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';

/**
 * Class to validate Okta active user
 */
@Injectable()
export class AuthenticationGuard implements CanActivate {

    private readonly logger = new Logger(AuthenticationGuard.name);

    /**
     * framework method to determine access.
     * @param context
     */
    canActivate( context: ExecutionContext): boolean {

        const request = context.switchToHttp().getRequest();
        return this.validateRequest(request);

    }

    /**
     * Request valid if basic profile is active;
     * @param request
     */
    private validateRequest(request: Request): boolean {

        var basicProfile = JSON.parse(request.headers['x-basic-profile']);
        this.logger.verbose('User is active:  ' + basicProfile.active) ;
        
        return basicProfile.active || false ;

    }
}
