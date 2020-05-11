import { Logger, PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';

/**
 * Input param validator
 */
@Injectable()
export class NumberValidationPipe implements PipeTransform<string, number> {

    private readonly logger = new Logger(NumberValidationPipe.name);

    /**
     * Simple data validation logic.
     * @param value
     * @param metadata
     */
    transform(value: string, metadata: ArgumentMetadata): number {

        const regex = /^[0-9]+$/;
        if (value && metadata.type === 'param' && !regex.test(value)) {
            this.logger.log('Validation failed:  ' + value) ;
            throw new BadRequestException('Bad input.') ;
        }

        if (value && metadata.type === 'query' && !regex.test(value)) {
            this.logger.log('Validation failed:  ' + value) ;
            throw new BadRequestException('Bad input.') ;
        }

        return Number(value);
    }
}
