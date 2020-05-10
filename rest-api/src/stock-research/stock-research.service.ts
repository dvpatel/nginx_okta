import { Injectable, HttpService, Logger } from '@nestjs/common';

import { map, mergeMap, toArray, tap } from 'rxjs/operators';
import { Observable, from, throwError } from 'rxjs';

import { ConfigService } from '../config/config.service';
import { Financials } from './financial.model';

/**
 * Stock research service.
 */
@Injectable()
export class StockResearchService {

  private readonly logger = new Logger(StockResearchService.name);

  private static readonly SERVICE_PROVIDER_KEY: string = 'SERVICE_PROVIDER_URL';
  private providerUrl: string;

  /**
   * Init service with external dependencies
   * @param config Configuration object
   * @param http HttpUtil
   */
  constructor(private config: ConfigService, private http: HttpService) {
    this.providerUrl = this.config.get(StockResearchService.SERVICE_PROVIDER_KEY);
  }

  /**
   * Get financials for given stock.
   * @param stockSymbol Stock symbol
   * @param annual Set to true for annualized financials.  Default is quarterly
   * @returns RxJS Observable compatible response object
   */
  private getFinancialsPerStock(stockSymbol: string, annual: boolean = false): Observable<Financials> {
    return this.http.get<Financials>(this.buildProviderUrl(stockSymbol, annual))
      .pipe(
        map(response => response.data),
        tap(response => this.logger.log('Received financials for:  ' + response.symbol)),
      );
  }

  /**
   * Get multiple financials for array of symbols
   * @param stockSymbols
   * @param annual
   */
  getFinancials(stockSymbols: string[], annual: boolean = false): Observable<Financials[]> {

    //  limit to 5 so as not to overwhelm service provider ;
    if (stockSymbols.length > 20) {
      return throwError('limit exceeded.') ;
    }

    return from(stockSymbols)
    .pipe(
      mergeMap((symbol: string) => this.getFinancialsPerStock(symbol.trim(), annual)),
      toArray(),
    ) ;
  }

  /**
   * Build provider url given stock and period
   * @param stockSymbol Stock symbol
   * @param annual Quarterly or Annual.  Default quarterly
   */
  private buildProviderUrl(stockSymbol: string, annual: boolean = false): string {

    //  $1/financials?period=annual
    let parameterizedUrl = this.providerUrl + '/' + stockSymbol + '/financials';
    if (annual) {
      parameterizedUrl = parameterizedUrl + '?period=annual';
    }

    return parameterizedUrl;
  }

}
