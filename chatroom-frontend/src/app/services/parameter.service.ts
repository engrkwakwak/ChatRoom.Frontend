import { Injectable } from '@angular/core';
import { UserSearchParameters } from '../dtos/shared/user-search-parameters.dto';
import { ContactParameters } from '../dtos/shared/contact-parameters.dto';

@Injectable({
  providedIn: 'root'
})
export class ParameterService {

  constructor() { }

  createUserSearchParameters(name: string): UserSearchParameters {
    return {
      PageNumber: 1,
      PageSize: 6,
      HasNext: false,
      HasPrevious: false,
      TotalCount: 0,
      TotalPages: 0,
      Name: name
    };
  }

  createContactParameters(name: string, userId: number): ContactParameters {
    return {
      PageNumber: 1,
      PageSize: 6,
      HasNext: true,
      HasPrevious: false,
      TotalCount: 0,
      TotalPages: 0,
      Name: name,
      UserId: userId
    }
  }
}
