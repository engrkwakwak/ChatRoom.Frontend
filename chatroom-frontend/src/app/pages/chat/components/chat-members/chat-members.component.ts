import { Component, Input, TemplateRef, ViewChild } from '@angular/core';
import { NbDialogRef, NbDialogService } from '@nebular/theme';
import { ChatDto } from '../../../../dtos/chat/chat.dto';
import { ChatService } from '../../../../services/chat.service';
import { Subscriber, Subscription, debounceTime, distinctUntilChanged, take, takeUntil } from 'rxjs';
import { ChatMemberDto } from '../../../../dtos/chat/chat-member.dto';
import { ErrorHandlerService } from '../../../../services/error-handler.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { UserSearchParameters } from '../../../../dtos/shared/user-search-parameters.dto';
import { UserService } from '../../../../services/user.service';
import { UserDto } from '../../../../dtos/chat/user.dto';

@Component({
  selector: 'app-chat-members',
  templateUrl: './chat-members.component.html',
  styleUrl: './chat-members.component.scss'
})
export class ChatMembersComponent {
  constructor(
    private nbDialogService : NbDialogService,
    private chatService : ChatService,
    private errorHandlerService : ErrorHandlerService,
    private fb : FormBuilder,
    private userService: UserService,
  ){}

  private subscriptions : Subscription[] = [];
  @Input({required: true}) chat? : ChatDto;
  private dialogRef? : NbDialogRef<any>;
  @ViewChild('chatMembersRef') private chatMembersRef? : TemplateRef<any>
  members : ChatMemberDto[] = [];
  users : UserDto[] = [];

  searchForm : FormGroup = this.fb.group({
    'search' : []
  });
  isProcessing: boolean = false;
  userParameters: UserSearchParameters = {
    Name: '',
    HasNext: false,
    HasPrevious: false,
    PageNumber: 1,
    PageSize: 10,
    TotalCount: 0,
    TotalPages: 0
  };
  
  ngOnDestroy(): void {
    this.subscriptions.forEach((val, i) => {
      this.subscriptions[i].unsubscribe();
    })
  }

  ngOnInit() : void{
    const _subscription  = this.search?.valueChanges
    .pipe(
      debounceTime(300),
      distinctUntilChanged()
    )
    .subscribe((value : string) => {
      this.userParameters.Name = value;
      this.userParameters.PageNumber = 1;
      console.log(value)
      if((!value) || value.trim() == "" ){
        // display members
      }
      else{
        // display user results
        this.searchUsers()
      }
    });

    this.subscriptions.push(_subscription!);
  }

  get search(){
    return this.searchForm.get("search")
  }


  private searchUsers(){
    this.userService.searchUsersByName(this.userParameters)
    .subscribe({
      next: (users : UserDto[]) => {
        if(this.userParameters.PageNumber == 1){
          this.users = users;
        }
        else{
          this.users.push(...users);
        }
        this.userParameters.PageNumber++;
      }
    });
  }

  close(){
    this.dialogRef?.close();
  }

  open(){
    this.dialogRef = this.nbDialogService.open(this.chatMembersRef!)
    console.log(this.chat)
    this.chatService.getMembersByChatId(this.chat?.chatId!)
    .pipe(
      take(1)
    )
    .subscribe({
      next : (members : ChatMemberDto[]) =>{
        this.members = members;
        console.log(members)
      },
      error : err => this.errorHandlerService.handleError(err)
    })
  }

  getMembership(user:UserDto){
    return this.members.filter(member => {
      return member.user.userId == user.userId || member.userId == user.userId
    })[0];
  }

  

  
}
