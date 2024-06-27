import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { NbDialogRef, NB_DIALOG_CONFIG } from '@nebular/theme';
import { ChatForCreationDto } from '../../../../dtos/chat/chat-for-creation.dto';
import { UserDto } from '../../../../dtos/chat/user.dto';
import { UserProfileService } from '../../../../services/user-profile.service';
import { UserSearchParameters } from '../../../../dtos/shared/user-search-parameters.dto';
import { UserService } from '../../../../services/user.service';
import { ErrorHandlerService } from '../../../../services/error-handler.service';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-add-members-modal',
  templateUrl: './add-members-modal.component.html',
  styleUrl: './add-members-modal.component.scss'
})
export class AddMembersModalComponent implements OnInit, OnDestroy {
  searchForm!: FormGroup;
  userParameters!: UserSearchParameters;
  filteredUsers: UserDto[] = [];
  selectedUsers: UserDto[] = [];
  isProcessing: boolean = false;
  tempPictureUrl: string | null = null;

  constructor(
    protected ref: NbDialogRef<AddMembersModalComponent>,
    @Inject(NB_DIALOG_CONFIG) public chat: ChatForCreationDto,
    private userProfileService: UserProfileService,
    private userService: UserService,
    private errorHandlerService: ErrorHandlerService
  ){}

  ngOnDestroy(): void {
    if(this.tempPictureUrl) {
      this.deletePicture(this.tempPictureUrl);
    }
  }

  ngOnInit(): void {
    this.tempPictureUrl = this.chat.displayPictureUrl || null;
    this.searchForm = this.createSearchForm();
    this.userParameters = this.createUserParameters();
    this.setupSearchListener();
    this.searchMembers();

  }
  public deletePicture(fileUri: string) {
    this.userProfileService.deletePicture(fileUri).subscribe({
      next: () => {
        this.tempPictureUrl = null;
      },
      error: (err) => this.errorHandlerService.handleError(err)
    });
  }

  createSearchForm(): FormGroup {
    return new FormGroup({
      search: new FormControl('')
    });
  }

  createUserParameters(): UserSearchParameters {
    return {
      Name: '',
      HasNext: false,
      HasPrevious: false,
      PageNumber: 1,
      PageSize: 10,
      TotalCount: 0,
      TotalPages: 0
    };
  }

  setupSearchListener(): void {
    this.searchForm.get('search')?.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(value => {
        this.userParameters.Name = value;
        this.userParameters.PageNumber = 1;
        this.searchMembers();
      });
  }

  searchMembers() {
    if(this.isProcessing) {
      console.log("Please wait. Processing previous results...")
      return;
    }
    this.isProcessing = true;
    this.getSearchResults(false);
  }

  getSearchResults(isLoadNext: boolean) {
    const uri: string = `/users?pageNumber=${this.userParameters.PageNumber}&pageSize=${this.userParameters.PageSize}&name=${this.userParameters.Name}`;
    this.userService.getUsers(uri).subscribe({
      next: (res) => {
        const newUsers = res.body || [];
        this.selectedUsers.forEach(selectedUser => {
          const index = newUsers.findIndex(user => user.userId === selectedUser.userId);
          if (index !== -1) {
            newUsers.splice(index, 1);
          }
        });

        const currentUserId = this.userProfileService.getUserIdFromToken();
        const index = newUsers.findIndex(user => user.userId === currentUserId);
        if (index !== -1) {
          
          newUsers.splice(index, 1);
        }

        if(isLoadNext){
          this.filteredUsers = [...this.filteredUsers, ...newUsers];
        } else {
          this.filteredUsers = newUsers
        }

        const paginationJson = res.headers.get('X-Pagination');
        if(paginationJson) {
          const paginationData = JSON.parse(paginationJson);

          this.userParameters.HasNext = paginationData.HasNext ?? false;
          this.userParameters.HasPrevious = paginationData.HasPrevious ?? false;
          this.userParameters.PageNumber = paginationData.CurrentPage ?? 1;
          this.userParameters.PageSize = paginationData.PageSize ?? 10;
          this.userParameters.TotalCount = paginationData.TotalCount ?? 0;
          this.userParameters.TotalPages = paginationData.TotalPages ?? 0;
        }

        this.isProcessing = false;
      },
      error: (err) => { 
        this.errorHandlerService.handleError(err);
        this.isProcessing = false;
      }
    });
  }

  dismiss() {
    this.ref.close();
  }

  complete() {
    this.chat.chatMemberIds = this.selectedUsers.map(user => user.userId);
    const loggedInUserId: number = this.userProfileService.getUserIdFromToken();
    this.chat.chatMemberIds.push(loggedInUserId);
    this.tempPictureUrl = null;
    this.ref.close(this.chat);
  }

  fetchNext(){
    if(this.isProcessing || !this.userParameters.HasNext) {
      return;
    }
    this.isProcessing = true;
    this.userParameters.PageNumber++;
    
    this.getSearchResults(true);
  }

  toggleUserSelection(user: UserDto, isSelected: boolean) {
    if (isSelected) {
      this.selectedUsers.push(user);
      this.filteredUsers = this.filteredUsers.filter(selectedUser => selectedUser.userId !== user.userId);
    } else {
      this.filteredUsers.push(user)
      this.selectedUsers = this.selectedUsers.filter(selectedUser => selectedUser.userId !== user.userId);
    }
  }
}
