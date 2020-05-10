import {Stock} from './stock.model' ;

export class WatchList {
    watchListId: number;
    stocks: Stock[];
    name: string;
    creationDate: Date;
    notes: string;
}
