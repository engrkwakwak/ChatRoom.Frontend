import { Injectable } from '@angular/core';
import { NbToastrService } from '@nebular/theme';

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlerService {

  constructor(
    private toastrService : NbToastrService
  ) { }

  public handleError(error : any){
    console.log(error)
    if(error.error && error.error.Message){
      this.toastrService.show(error.error.Message, "Error", {
        status: "danger",
        icon : "alert-triangle"
      });
    }
    if(error.error && error.error.message){
      this.toastrService.show(error.error.message, "Error", {
        status: "danger",
        icon : "alert-triangle"
      });
    }
  }
}
