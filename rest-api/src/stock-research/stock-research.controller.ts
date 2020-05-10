import { HttpStatus, Controller, Res, Get, Param, Query, UsePipes, Logger } from '@nestjs/common';
import { StockResearchService } from './stock-research.service';
import {QueryValidationPipe } from '../util/query-validation.pipe' ;
import { SymbolValidationPipe } from '../util/symbol-validation.pipe' ;
import { ErrorUtil } from '../util/error';

/**
 * Controller for /financials requests
 */
@Controller('financials')
export class StockResearchController {

  private readonly logger = new Logger(StockResearchController.name);

  /**
   * DI of service provider.
   * @param service
   */
  constructor(private readonly service: StockResearchService) { }

  /**
   * Returns Financials payload after data validation.
   * @param symbol stock symbols, comma separated
   * @param timePeriod annual or quarterly financials.  Default is quarterly
   */
  @Get(':timePeriod')
  @UsePipes(new SymbolValidationPipe())
  getFinancials(
    @Query('symbols') symbols: string,
    @Param('timePeriod') timePeriod: string,
    @Res() response) {

    /**
     * Service resturns RXJS Observable<Financials> object.
     */
    const isAnnual: boolean = (timePeriod === 'annual') ? true : false ;
    this.service.getFinancials(symbols.split(','), isAnnual)
      .subscribe(result => {
        response.status(HttpStatus.OK).send(result);
      }, error => {
        const errorResp = ErrorUtil.errorResponseObject(error.response);
        response.status(errorResp.statusCode).send(ErrorUtil.errorResponseObject(error.response));
      });

  }
}
