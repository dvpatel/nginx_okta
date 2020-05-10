import { Logger, PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';

/**
 * query input validator
 */
@Injectable()
export class QueryValidationPipe implements PipeTransform< string, string> {

    private readonly logger = new Logger(QueryValidationPipe.name);

    /**
     * Simple data validation logic.
     * @param value
     * @param metadata
     */
    transform(value: string, metadata: ArgumentMetadata): string {

        const regex = /^[a-zA-Z.]{1,10}$/;
        if (value && metadata.type === 'query' && !regex.test(value)) {
            this.logger.log('Validation failed:  ' + value) ;
            throw new BadRequestException('Bad input.') ;
        }

        return value;
    }
}
