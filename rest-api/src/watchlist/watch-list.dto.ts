/**
 * Data Transfer Object for WatchList creation
 */
export class WatchListDto {
    readonly name: string;
    readonly stockIds: number[];
    readonly notes: string;
}
