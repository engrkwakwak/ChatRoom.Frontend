export  interface RequestParameters {
    PageSize : number;
    PageNumber : number;
    HasNext? : boolean;
    HasPrevious? : boolean;
    TotalCount? : number;
    TotalPages? : number;
}