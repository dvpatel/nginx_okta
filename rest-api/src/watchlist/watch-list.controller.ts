import { HttpStatus, Headers, UsePipes, Controller, Body, Res, Get, Post, Put, Delete, Param, Query, UseFilters, Logger } from '@nestjs/common';
import { ErrorUtil } from '../util/error';

import { NumberValidationPipe } from '../util/number-validation.pipe';
import { BodyValidationPipe } from '../util/body-validation.pipe' ;

import { WatchListService } from './watch-list.service';
import { WatchListDto } from './watch-list.dto';

/**
 * Controller for /watchlist requests
 */
@Controller('watchlist')
export class WatchListController {

  private readonly logger = new Logger(WatchListController.name);

  /**
   * DI of service provider.
   * @param service
   */
  constructor(private readonly service: WatchListService) { }

  /**
   * Returns customer's watchlist
   */
  @Get(':watchListId')
  @UsePipes(new NumberValidationPipe())
  getCustomerWatchListById(@Headers('x-basic-profile') basicProfileHeader, @Param('watchListId') watchListId: number, @Res() response) {

    this.logger.debug(basicProfileHeader);

    //  Get basic profile from header;
    var basicProfile = JSON.parse(basicProfileHeader);

    const customerId = 1;
    this.service.getCustomerWatchListById(customerId, basicProfile.sub, watchListId)
      .subscribe(result => {
        response.status(HttpStatus.OK).send(result);
      }, error => {
        const errorResp = this.getError(error);
        response.status(errorResp.statusCode).send(errorResp);
      });
  }

  /**
   * Returns customer's watchlist
   */
  @Get()
  getCustomerWatchLists(@Res() response) {

    //  Assume customerId = 1 ;  Can use AuthGuard to retrieve proper id AFTER security check.
    const customerId = 1;
    this.service.getCustomerWatchLists(customerId)
      .subscribe(result => {
        response.status(HttpStatus.OK).send(result);
      }, error => {
        const errorResp = this.getError(error);
        response.status(errorResp.statusCode).send(errorResp);
      });
  }

  /**
   * Add new watchlist
   */
  @Post()
  @UsePipes(new BodyValidationPipe())
  createWatchList(@Body() watchListDto: WatchListDto, @Res() response) {

    //  Assume customerId = 1 ;
    const customerId = 1;
    this.service.addWatchList(customerId, watchListDto.name, watchListDto.stockIds, watchListDto.name)
      .subscribe(result => {
        response.status(HttpStatus.OK).send(this.successStatus(result.toString()));
      }, error => {
        const errorResp = this.getError(error);
        response.status(errorResp.statusCode).send(errorResp);
      });

  }

  /**
   * Update existing watchlist.
   * @param id watch list id.
   * @param watchListDto
   */
  @Put(':watchListId')
  @UsePipes(new BodyValidationPipe())
  updateWatchList(@Param('watchListId') watchListId: number, @Body() watchListDto: WatchListDto, @Res() response) {

    //  Assume customerId = 1 ;
    const customerId = 1;
    this.service.updateWatchList(customerId, watchListId, watchListDto.name, watchListDto.stockIds, watchListDto.name)
      .subscribe(result => {
        response.status(HttpStatus.OK).send(this.successStatus('Update successful.'));
      }, error => {
        const errorResp = this.getError(error);
        response.status(errorResp.statusCode).send(errorResp);
      });

  }

  /**
   * Delete watchlist / stock from customer watchlist.
   * @param watchListId
   * @param stockId
   */
  @Delete(':watchListId')
  @UsePipes(new NumberValidationPipe())
  deleteStockInWatchList(@Param('watchListId') watchListId: number, @Query('stockId') stockId: number, @Res() response) {

    //  Assume customerId = 1 ;  Can use AuthGuard to retrieve proper id AFTER security check.
    const customerId = 1;

    this.service.deleteWatchItem(customerId, watchListId, stockId)
      .subscribe(result => {
        response.status(HttpStatus.OK).send(this.successStatus('Successful item delete.'));
      }, error => {
        const errorResp = this.getError(error);
        response.status(errorResp.statusCode).send(errorResp);
      });
  }

  /**
   * Error helper
   * @param errorMessage
   */
  private getError(errorMessage: string) {
    return ErrorUtil.errorResponseObject(
      {
        status: HttpStatus.BAD_REQUEST,
        statusText: errorMessage,
        request: {
          path: 'no_path',
        },
      },
    );
  }

  /**
   * Helper for status response
   * @param statusMessage
   */
  private successStatus(statusMessage: string) {
    return {
      status: HttpStatus.OK,
      statusText: statusMessage,
    };
  }
}
