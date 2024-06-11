import { RequestParameters } from "./request-parameters.dto";

export interface ChatParameters extends RequestParameters {
    UserId : number,
    Name : string
}