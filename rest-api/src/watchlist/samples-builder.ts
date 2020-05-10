import { Injectable, HttpService, Logger } from '@nestjs/common';
import * as fs from 'fs';

import { map, tap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';

import { ConfigService } from '../config/config.service';
import { WatchList } from './watch-list.model';
import { WatchLists } from './watch-lists.model';
import { Stock } from './stock.model';

/**
 * Sample data builder ;
 */
@Injectable()
export class SamplesBuilder {

    private readonly logger = new Logger(SamplesBuilder.name);

    private stocksListFile: string = './src/env/stocks.csv';
    private sampleDataMap: Map<number, WatchLists>;
    private stocks: Stock[] ;

    /**
     * Samples
     */
    constructor() {
        this.sampleDataMap = new Map<number, WatchLists>();
        this.buildSampleDataMap();
    }

    /**
     * Build stocks ;
     * @param stockIds
     */
    public getStocksByIds(stockIds: number[]): Stock[] {
        const stocks = new Array<Stock>();
        stockIds.forEach((stockId: number) => {
            stocks.push(this.stocks[stockId]) ;
        }) ;
        return stocks ;
    }

    /**
     * Samples ;
     */
    public getWatchListsSamples(): Map<number, WatchLists> {
        return this.sampleDataMap ;
    }

    /**
     * Sample data builder for watchlist ; ;
     */
    private buildSampleDataMap(): void {
        const stocks = new Array<Stock>();
        fs.readFile(this.stocksListFile, 'utf8', (error, data) => {
            data.split('\n').forEach((item) => {
                const stock = item.split('\t');
                this.buildStock(stocks, stock[1], stock[0]);
            }) ;

            this.stocks = stocks ;

            //  Build 20 sample watchlists ;
            this.buildWatchLists(20) ;
        });
    }

    /**
     * Watchlist builder
     * @param stocks
     * @param count
     */
    private buildWatchLists(count: number): void {
        for (let i = 0; i < count; i++) {
            this.sampleDataMap.set(i, this.generateWatchLists(i, this.stocks));
        }
    }

    /**
     * Generate watch list
     * @param stocks
     */
    private generateWatchLists(watchListsId: number, stocks: Stock[]): WatchLists {

        //  Randomly create number of watchlists per user between 3 and 10 ;
        const count = Math.floor(Math.random() * 10) + 3;
        const watchLists = new Array<WatchList>() ;

        for (let i = 0; i < count; i++) {
            watchLists.push(this.generateRandomWatchList(i, stocks)) ;
        }

        const watchListsObj = new WatchLists() ;
        watchListsObj.watchListsId = watchListsId ;
        watchListsObj.list = watchLists ;

        return watchListsObj ;
    }

    /**
     * Random WatchList Generator ;
     * @param stocks
     */
    private generateRandomWatchList(id: number, stocks: Stock[]): WatchList {

        //  Generate random watchlist between size 5 and 15 ;
        const count = Math.floor(Math.random() * 20) + 5;

        const watchList = new WatchList();
        watchList.creationDate = new Date();
        watchList.watchListId = id;
        watchList.name = 'My Awesome Watchlist ' + watchList.watchListId;
        watchList.stocks = new Array<Stock>() ;

        for (let i = 0; i < count; i++) {
            const indx = Math.floor(Math.random() * stocks.length) + 1;
            watchList.stocks.push(stocks[indx]) ;
        }

        return watchList;
    }

    /**
     * Sample data builder for stocks
     * @param id
     * @param symbol
     * @param name
     */
    private buildStock(stocks: Stock[], symbol: string, name: string): void {
        const stock = new Stock();
        stock.stockId = stocks.length;
        stock.symbol = symbol;
        stock.companyName = name;

        stocks.push(stock) ;
    }

}
