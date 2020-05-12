import {Stock} from './stock.model' ;

export class WatchList {
    watchListId: number;
    subject: string;
    stocks: Stock[];
    name: string;
    creationDate: Date;
    notes: string;
}
