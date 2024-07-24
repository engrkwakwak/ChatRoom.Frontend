import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../../services/user.service';
import { ContactService } from '../../../../services/contact.service';
import { AuthService } from '../../../../services/auth.service';
import { Router } from '@angular/router';
import { UserSearchParameters } from '../../../../dtos/shared/user-search-parameters.dto';
import { ContactParameters } from '../../../../dtos/shared/contact-parameters.dto';
import { UserDto } from '../../../../dtos/chat/user.dto';
import { ChatService } from '../../../../services/chat.service';
import { SignalRService } from '../../../../services/signal-r.service';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { ParameterService } from '../../../../services/parameter.service';
import { ErrorHandlerService } from '../../../../services/error-handler.service';

@Component({
  selector: 'app-chat-contacts',
  templateUrl: './chat-contacts.component.html',
  styleUrls: ['./chat-contacts.component.scss'],
})
export class ChatContactsComponent implements OnInit {
  users: UserDto[] = [];
  contacts: UserDto[] = [];
  userParams!: UserSearchParameters;
  contactParams!: ContactParameters;
  loadingStatus = { users: false, contacts: false };
  searchInput: Subject<string> = new Subject<string>();

  constructor(
    private userService: UserService,
    private contactService: ContactService,
    private authService: AuthService,
    private router: Router,
    private chatModuleService: ChatService,
    private signalRService: SignalRService,
    private parameterService: ParameterService,
    private errorHandlerService: ErrorHandlerService
  ) {}

  ngOnInit(): void {
    const userId = this.authService.getUserIdFromSession();
    this.userParams = this.parameterService.createUserSearchParameters('');
    this.contactParams = this.parameterService.createContactParameters(
      '',
      userId
    );

    this.fetchContacts();

    this.signalRService.getContactsUpdated().subscribe(() => {
      this.onContactUpdate();
    });

    this.searchInput
      .pipe(distinctUntilChanged(), debounceTime(300))
      .subscribe((keyword) => {
        this.search(keyword);
      });
  }

  onSearchInput(ev: any) {
    this.searchInput.next(ev.target.value);
  }

  search(keyword: string) {
    this.resetUsers(keyword);
    this.resetContacts(keyword);

    this.loadingStatus.users = true;
    this.loadingStatus.contacts = true;

    const userUri: string = `/users?pageNumber=${this.userParams.PageNumber}&pageSize=${this.userParams.PageSize}&name=${this.userParams.Name}`;
    this.userService
      .searchUsersAndContacts(userUri, this.contactParams)
      .subscribe({
        next: ({ users, contacts }) => {
          if (this.userParams.Name.trim() !== '') {
            this.users = users.body || [];
          }
          this.contacts = contacts;

          const paginationJson = users.headers.get('X-Pagination');
          if (paginationJson) {
            this.setPaginationValues(paginationJson);
          }

          this.contactParams.PageNumber++;
        },
        error: (err) => this.errorHandlerService.handleError(err),
        complete: () => {
          this.loadingStatus.users = false;
          this.loadingStatus.contacts = false;
        },
      });
  }

  private resetUsers(name: string) {
    this.users = [];
    this.userParams = this.parameterService.createUserSearchParameters(name);
  }

  private resetContacts(name: string) {
    this.contacts = [];
    this.contactParams = this.parameterService.createContactParameters(
      name,
      this.contactParams.UserId
    );
  }

  fetchUsers() {
    if (this.loadingStatus.users || !this.userParams.HasNext) return;

    this.userParams.PageNumber++;
    this.loadingStatus.users = true;
    const uri: string = `/users?pageNumber=${this.userParams.PageNumber}&pageSize=${this.userParams.PageSize}&name=${this.userParams.Name}`;
    this.userService.getUsers(uri).subscribe({
      next: (res) => {
        if (res.body && res.body.length > 0 && this.userParams.Name !== '') {
          this.users.push(...res.body);
        }

        const paginationJson = res.headers.get('X-Pagination');
        if (paginationJson) {
          this.setPaginationValues(paginationJson);
        }
      },
      error: () => {
        this.loadingStatus.users = false;
      },
      complete: () => {
        this.loadingStatus.users = false;
      },
    });
  }

  fetchContacts() {
    if (this.loadingStatus.contacts) return;

    this.loadingStatus.contacts = true;
    this.userService.searchContactsByNameUserId(this.contactParams).subscribe({
      next: (res) => {
        if (res.length > 0) {
          this.contacts.push(...res);
          this.contactParams.PageNumber++;
        }
      },
      error: () => {
        this.loadingStatus.contacts = false;
      },
      complete: () => {
        this.loadingStatus.contacts = false;
      },
    });
  }

  onContactUpdate() {
    this.resetContacts(this.contactParams.Name);
    this.fetchContacts();
  }

  hideContactList() {
    this.chatModuleService.hideChatlist();
  }

  viewMessages(user: UserDto) {
    if (this.chatModuleService.isMobile) {
      this.hideContactList();
    }
    this.router.navigate([`/chat/view/from-contacts/${user.userId}`]);
  }

  setPaginationValues(paginationJson: string) {
    const paginationData = JSON.parse(paginationJson);

    this.userParams.HasNext = paginationData.HasNext ?? false;
    this.userParams.HasPrevious = paginationData.HasPrevious ?? false;
    this.userParams.PageNumber = paginationData.CurrentPage ?? 1;
    this.userParams.PageSize = paginationData.PageSize ?? 10;
    this.userParams.TotalCount = paginationData.TotalCount ?? 0;
    this.userParams.TotalPages = paginationData.TotalPages ?? 0;
  }
}
