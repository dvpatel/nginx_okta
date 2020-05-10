import { Logger, Injectable, CanActivate, ExecutionContext } from '@nestjs/common';

/**
 * Class to validate Authorization token
 */
@Injectable()
export class TokenValidationGuard implements CanActivate {

    private readonly logger = new Logger(TokenValidationGuard.name);

    public static readonly AUTHORIZATION: string = 'authorization';

    /**
     * framework method to determine access.
     * @param context
     */
    canActivate( context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        return this.validateRequest(request);
    }

    /**
     * validate bearer token.
     * @param request
     */
    private validateRequest(request: Request): boolean {
        var bearerToken = request.headers[TokenValidationGuard.AUTHORIZATION];
        
        //  Regex for base64 string validation
        var bearerRegEx = /^Bearer\s[A-Za-z0-9-_.\s]{100,1000}$/g;
        return (bearerRegEx.test(bearerToken)) ? true : false;
    }
}
