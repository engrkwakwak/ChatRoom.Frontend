import { RequestParameters } from "./request-parameters.dto";

export interface ContactParameters extends RequestParameters {
    Name : string
    UserId : number
}