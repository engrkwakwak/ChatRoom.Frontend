import { Component } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { UserSearchParameters } from '../../../../dtos/shared/user-search-parameters.dto';
import { UserService } from '../../../../services/user.service';
import { UserDto } from '../../../../dtos/chat/user.dto';
import { take } from 'rxjs';

@Component({
  selector: 'app-chat-contacts',
  templateUrl: './chat-contacts.component.html',
  styleUrl: './chat-contacts.component.scss'
})
export class ChatContactsComponent {
  constructor(
    private spinner : NgxSpinnerService,
    private userService : UserService
  ){}

  users:UserDto[] = [];
  loading : boolean = false;
  params : UserSearchParameters  = {
    PageNumber : 1,
    PageSize  : 50,
    Name : ""
  };

  public search(ev : any){
    this.params.Name = ev.target.value.trimEnd()
    console.log(ev.target.value.trimEnd())
    if(!ev.target.value || ev.target.value.trimEnd() == " "){
      this.hideLoading();
      return;
    }
    
    this.showLoading();
    this.userService.searchUsersByName(this.params)
    .subscribe({
      next: (res) => {
        console.log(res)
        this.users = res;
        console.log("must be done")
      },
      error: () => {
        if(this.loading == true){
          this.hideLoading();
        }
      },
      complete: () => {
        if(this.loading == true){
          this.hideLoading();
        }
        console.log("completed")
      }
    })
  }

  showLoading(){
    // if(this.loading == false){
      console.log("shown")
      this.loading = true;
      this.spinner.show();
    // }
  }

  hideLoading(){
    console.log("hidden");
    // if(this.loading == true){

      this.loading = false;
      this.spinner.hide();
    // }
  }


  ngOnInit(){
    // this.spinner.show();
    
    console.log("init")
  }

}
