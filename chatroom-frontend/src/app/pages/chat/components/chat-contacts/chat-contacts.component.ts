import { Component } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { UserSearchParameters } from '../../../../dtos/shared/user-search-parameters.dto';
import { UserService } from '../../../../services/user.service';
import { UserDto } from '../../../../dtos/chat/user.dto';
import { take } from 'rxjs';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-chat-contacts',
  templateUrl: './chat-contacts.component.html',
  styleUrl: './chat-contacts.component.scss'
})
export class ChatContactsComponent {
  constructor(
    private userService : UserService
  ){}

  users:UserDto[] = [];
  userParams : UserSearchParameters  = {
    PageNumber : 1,
    PageSize  : 6,
    Name : ""
  };
  loadingStatus : {Users:boolean, Contacts:boolean} = {
    Users: false,
    Contacts : false
  }
  hasStartedSearching : boolean = false;

  search(ev : any){
    const name : string = ev.target.value.trimEnd();
    this.resetUsers(ev.target.value.trimEnd());
    if(!ev.target.value || ev.target.value.trimEnd() == " "){
      return;
    }
    this.hasStartedSearching = true;
    this.fetchUser();
  }

  fetchUser() {
    console.log("fetching users")
    if(this.userParams.Name.length <= 0 || this.loadingStatus.Users){
      return;
    }
    this.loadingStatus.Users = true;
    this.userService.searchUsersByName(this.userParams)
    .subscribe({
      next: (res) => {
        if(res.length > 0){
          this.users.push(...res);
          this.userParams.PageNumber++;
        }
      },
      error: () => {
        this.loadingStatus.Users = false;
      },
      complete: () => {
        this.loadingStatus.Users = false;
        console.log("done fetching users")
      }
    })
  }

  private resetUsers(name : string){
    this.users = [];
    this.loadingStatus.Users = false;
    this.userParams = {
      PageSize: this.userParams.PageSize,
      PageNumber : 1,
      Name: name
    }
  }

  loadNext(){
    console.log("Load next")
  }


  ngOnInit(){
    console.log("init")
  }

  

}
