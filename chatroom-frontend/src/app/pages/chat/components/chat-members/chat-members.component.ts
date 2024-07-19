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
import { Subject } from '@microsoft/signalr';

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
    });
  }

  ngOnInit() : void{
    const _s1  = this.search?.valueChanges
    .pipe(
      debounceTime(300),
      distinctUntilChanged()
    )
    .subscribe((value : string) => {
      this.userParameters.Name = value;
      this.userParameters.PageNumber = 1;
      this.searchUsers()
    });

    const _s2 = this.chatService.onMemberRemove.subscribe((chatMember : ChatMemberDto) => {
      this.close();
    });

    this.subscriptions.push(...[_s1!, _s2!]);
  }

  get search(){
    return this.searchForm.get("search")
  }

  searchUsers(){
    this.isProcessing = true;
    const uri: string = `/users?pageNumber=${this.userParameters.PageNumber}&pageSize=${this.userParameters.PageSize}&name=${this.userParameters.Name}`;
    this.userService.getUsers(uri)
    .subscribe({
      next: (res) => {
        if(this.userParameters.PageNumber == 1){
          this.users = res.body!;
        }
        else{
          this.users.push(...res.body!);
        }
        this.userParameters.PageNumber++;
        this.isProcessing = false;
      },
      error : err => {
        this.isProcessing = false
      },
    });
  }

  close(){
    this.dialogRef?.close();
    this.members = [];
    this.users = [];
    this.userParameters.PageNumber = 1;
    this.userParameters.Name = ""
    this.search?.setValue("");
  }

  open(){
    this.dialogRef = this.nbDialogService.open(this.chatMembersRef!)
    this.isProcessing = true;
    this.fetchMembers();
  }

  fetchMembers(){
    this.chatService.getMembersByChatId(this.chat?.chatId!)
    .pipe(
      take(1)
    )
    .subscribe({
      next : (members : ChatMemberDto[]) =>{
        this.members = members;
        this.isProcessing = false;
      },
      error : err => {
        this.errorHandlerService.handleError(err);
        this.isProcessing = false;
      }
    })
  }

  getMembership(user:UserDto){
    return this.members.filter(member => {
      return member.user.userId == user.userId || member.userId == user.userId
    })[0];
  }

  memberAdded(){
    this.fetchMembers()
  }



}
