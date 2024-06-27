import { Component } from '@angular/core';
import { UserService } from '../../../../services/user.service';
import { ContactService } from '../../../../services/contact.service';
import { AuthService } from '../../../../services/auth.service';
import { Router } from '@angular/router';
import { UserSearchParameters } from '../../../../dtos/shared/user-search-parameters.dto';
import { ContactParameters } from '../../../../dtos/shared/contact-parameters.dto';
import { UserDto } from '../../../../dtos/chat/user.dto';
import { ChatService } from '../../../../services/chat.service';
import { SignalRService } from '../../../../services/signal-r.service';
import { Subject, debounce, debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-chat-contacts',
  templateUrl: './chat-contacts.component.html',
  styleUrls: ['./chat-contacts.component.scss']
})
export class ChatContactsComponent {
  users: UserDto[] = [];
  contacts: UserDto[] = [];
  userParams: UserSearchParameters = {
    PageNumber: 1,
    PageSize: 6,
    Name: ""
  };
  contactParams: ContactParameters = {
    PageNumber: 1,
    PageSize: 6,
    Name: "",
    UserId: 0
  };
  loadingStatus: { Users: boolean; Contacts: boolean } = {
    Users: false,
    Contacts: false
  };

  constructor(
    private userService: UserService,
    private contactService: ContactService,
    private authService: AuthService,
    private router: Router,
    private chatModuleService: ChatService,
    private signalRService : SignalRService
  ) {}

  searchInput : Subject<string> = new Subject<string>();
  search(keyword : string) {
    this.resetUsers(keyword);
    this.resetContacts(keyword);
    this.fetchContacts();
    if (!keyword || keyword.trimEnd() === " ") {
      return;
    }
    this.fetchUser();
  }

  onSearchInput(ev:any){
    this.searchInput.next(ev.target.value.trimEnd());
  }

  hideContactList() {
    this.chatModuleService.hideChatlist();
  }

  viewChat() {
    if(this.chatModuleService.isMobile){
      this.hideContactList();
    }
    this.router.navigate(['/chat/view/1']);
  }

  fetchUser() {
    let isSearching: boolean = true;
    if (this.userParams.Name.length <= 0 || this.loadingStatus.Users) {
      return;
    }
    setTimeout(() => {
      if (isSearching) {
        this.loadingStatus.Users = true;
      }
    }, 500);
    this.userService.searchUsersByName(this.userParams).subscribe({
      next: res => {
        if (res.length > 0) {
          this.users.push(...res);
          this.userParams.PageNumber++;
        }
      },
      error: () => {
        this.loadingStatus.Users = false;
      },
      complete: () => {
        this.loadingStatus.Users = false;
        isSearching = false;
      }
    });
  }

  fetchContacts() {
    if (this.loadingStatus.Contacts) {
      return;
    }
    this.loadingStatus.Contacts = true;
    this.contactService.searchContactsByNameUserId(this.contactParams).subscribe({
      next: res => {
        if (res.length > 0) {
          this.contacts.push(...res);
          this.contactParams.PageNumber++;
        }
      },
      error: () => {
        this.loadingStatus.Contacts = false;
      },
      complete: () => {
        this.loadingStatus.Contacts = false;
      }
    });
  }

  onContactUpdate() {
    this.resetContacts(this.contactParams.Name);
    this.fetchContacts();
  }

  viewMessages(user: UserDto) {
    if (this.chatModuleService.isMobile) {
      this.hideContactList();
    }
    this.router.navigate([`/chat/view/from-contacts/${user.userId}`]);
  }

  private resetUsers(name: string) {
    this.users = [];
    this.loadingStatus.Users = false;
    this.userParams = {
      PageSize: this.userParams.PageSize,
      PageNumber: 1,
      Name: name
    };
  }

  private resetContacts(name: string) {
    this.contacts = [];
    this.loadingStatus.Contacts = false;
    this.contactParams = {
      PageSize: this.userParams.PageSize,
      PageNumber: 1,
      Name: name,
      UserId: this.contactParams.UserId
    };
  }

  ngOnInit() {
    this.contactParams.UserId = this.authService.getUserIdFromSession();
    this.fetchContacts();
    this.signalRService.getContactsUpdated().subscribe(() => {
      this.onContactUpdate();
    });
    this.searchInput
    .pipe(
      distinctUntilChanged(),
      debounceTime(300)
    )
    .subscribe(keyword => {
      this.search(keyword)
    })
  }
}
