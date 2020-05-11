import { Logger, PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';

/**
 * Input param validator
 */
@Injectable()
export class BodyValidationPipe implements PipeTransform<string, string> {

    private readonly logger = new Logger(BodyValidationPipe.name);

    /**
     * Simple data validation logic.
     * @param value
     * @param metadata
     */
    transform(value: string, metadata: ArgumentMetadata): string {
        //  Put JSON DV Logic here...
        return value;
    }
}
