import { Injectable, HttpService, Logger } from '@nestjs/common';

import { map, tap } from 'rxjs/operators';
import { Observable, of, throwError } from 'rxjs';

import { WatchList } from './watch-list.model';
import { WatchLists } from './watch-lists.model';
import { Stock } from './stock.model';
import { SamplesBuilder } from './samples-builder';
import { watch } from 'fs';

/**
 * Watch list management service.
 */
@Injectable()
export class WatchListService {

    private readonly logger = new Logger(WatchListService.name);

    private sampleDataMap: Map<number, WatchLists>;

    /**
     * Init (real) service with external dependencies
     * @param config Configuration object
     * @param http HttpUtil
     */
    constructor(private samples: SamplesBuilder) {
        this.logger.log('Init watch list service with randomly generated data.');
        this.sampleDataMap = this.samples.getWatchListsSamples();
    }

    /**
     * Emulate customer.  Get customer's watch list by Id
     * @param customerId
     * @param watchListId
     */
    public getCustomerWatchListById(customerId: number, subject: string, watchListId: number): Observable<WatchList> {

        const watchList = this.sampleDataMap.get(customerId).list.filter(item => item.watchListId === watchListId);
        if (watchList && watchList.length === 1) {
            watchList[0].subject = subject;
            return of(watchList[0]);
        }

        this.logger.error('Error for watchListId:  ' + watchListId);
        return throwError('No such watchlist.');
    }

    /**
     * Emulate customer.  Get customer's watchlists.
     * @param customerId
     */
    public getCustomerWatchLists(customerId: number): Observable<WatchLists> {
        const watchLists = this.sampleDataMap.get(customerId);
        return of(watchLists);
    }

    /**
     * Create new watchlist for specific customer ;
     * @param customerId
     * @param watchList
     */
    public addWatchList(customerId: number, name: string, stockIds: number[], notes: string): Observable<number> {

        const watchLists = this.sampleDataMap.get(customerId);

        if (watchLists) {
            const newWatchList = new WatchList();
            newWatchList.watchListId = watchLists.list.length;
            newWatchList.creationDate = new Date();
            newWatchList.name = name;
            newWatchList.notes = notes;
            newWatchList.stocks = this.samples.getStocksByIds(stockIds);

            watchLists.list.push(newWatchList);

            return of(newWatchList.watchListId);
        }

        this.logger.error('Error adding to watchList:  ');
        return throwError('Error creating new watchlist.');
    }

    /**
     * Update existing watchlist.
     * @param customerId
     * @param watchListId
     * @param name
     * @param stockIds
     * @param notes
     */
    public updateWatchList(customerId: number, watchListId: number, name: string, stockIds: number[], notes: string): Observable<boolean> {
        const watchLists = this.sampleDataMap.get(customerId);
        if (watchLists) {
            const watchList = watchLists.list[watchListId];
            if (watchList) {

                this.logger.log('Updating watchlist:  ' + name) ;

                if (name) {
                    this.logger.log('Name:  ' + name) ;
                    watchList.name = name;
                }

                if (notes) {
                    watchList.notes = notes;
                }

                if (stockIds) {
                    watchList.stocks = this.samples.getStocksByIds(stockIds);
                }

                return of(true);
            }
        }

        this.logger.error('Error updating watchList:  ');
        return throwError('Error updating watchlist.');
    }

    /**
     * Delete watchlist / stockitem ;
     * @param customerId
     * @param watchListId
     * @param stockId
     */
    public deleteWatchItem(customerId: number, watchListId: number, stockId: number): Observable<boolean> {
        return (stockId) ?
            this.deleteStockFromCustomerWatchList(customerId, watchListId, stockId) :
            this.deleteCustomerWatchList(customerId, watchListId);
    }

    /**
     * Delete watchlist from customer
     * @param customerId
     * @param watchListId
     */
    private deleteCustomerWatchList(customerId: number, watchListId: number): Observable<boolean> {
        const watchLists = this.sampleDataMap.get(customerId);

        const indx = watchLists.list.findIndex((item) => item.watchListId === watchListId);
        if (indx !== -1 && watchLists.list[indx]) {
            watchLists.list.splice(indx, 1);
            return of(true);
        }

        this.logger.error('Error for watchListId:  ' + watchListId);
        return throwError('No such watchlist.');
    }

    /**
     * Delete stock in a watch list.
     * @param customerId
     * @param watchListId
     * @param stockId
     */
    private deleteStockFromCustomerWatchList(customerId: number, watchListId: number, stockId: number): Observable<boolean> {

        const watchLists = this.sampleDataMap.get(customerId);
        const indx = watchLists.list.findIndex((item) => item.watchListId === watchListId);

        if (watchLists.list[indx]) {
            const stocks = watchLists.list[indx].stocks;
            const stockIndx = stocks.findIndex((stock: Stock) => stock.stockId === stockId);
            if (stockIndx !== -1) {
                stocks.splice(stockIndx, 1);
                return of(true);
            }
        }

        return throwError('No stock in watchlist.');
    }
}
