import { HttpStatus } from '@nestjs/common';

/**
 * JSON Error helper ;
 */
export class ErrorUtil {

    private static readonly DEFAULT_SYSTEM_MESSAGE: string = 'System error.  Try again later.';

    /**
     * Helper to build error response for consumer
     * @param serviceError
     */
    public static errorResponseObject(serviceError: any) {

        let code: number = HttpStatus.SERVICE_UNAVAILABLE ;
        let statusMessage: string = ErrorUtil.DEFAULT_SYSTEM_MESSAGE ;
        let errorPath: string = '' ;
        if (serviceError) {
          code = serviceError.status ;
          statusMessage = serviceError.statusText ;

          errorPath = 'none';
          if (serviceError.request) {
            errorPath = serviceError.request.path ;
          }
        }
        return {
            statusCode:  code,
            error: statusMessage,
            message:  statusMessage,
            path:  errorPath,
            timestamp: new Date().toISOString(),
        } ;
    }
}
