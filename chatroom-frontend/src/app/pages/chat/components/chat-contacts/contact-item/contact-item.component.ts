import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { UserDto } from '../../../../../dtos/chat/user.dto';
import { MenuItem } from 'primeng/api';
import { ContactService } from '../../../../../services/contact.service';
import { ContactForCreationDto } from '../../../../../dtos/chat/contact-for-creation.dto';
import { AuthService } from '../../../../../services/auth.service';
import { NbDialogService, NbGlobalPhysicalPosition, NbToastrService } from '@nebular/theme';
import { ErrorHandlerService } from '../../../../../services/error-handler.service';
import { ContactDto } from '../../../../../dtos/chat/contact.dto';
import { UserProfileService } from '../../../../../services/user-profile.service';
import { Router } from '@angular/router';
import { Menu } from 'primeng/menu';
import { ChatService } from '../../../../../services/chat.service';
import { UserProfileComponent } from '../../user-profile/user-profile.component';

@Component({
  selector: 'app-contact-item',
  templateUrl: './contact-item.component.html',
  styleUrl: './contact-item.component.scss'
})
export class ContactItemComponent {
  constructor(
    private contactService : ContactService,
    private authService : AuthService,
    private toastrService : NbToastrService,
    private errorHandlerService : ErrorHandlerService,
    private userProfileService : UserProfileService,
    private chatModuleService : ChatService,
    private router : Router,
    private dialogService: NbDialogService
  ){}

  @Output() contactUpdated : EventEmitter<any> = new EventEmitter<any>();
  @Input({required: true}) user : UserDto = {
    userId: 0,
    username: '',
    displayName: '',
    email: '',
    isEmailVerified: false
  }; 
  contactInfo : ContactDto | null = null;
  options : MenuItem[] = [];

  @ViewChild("menu") menu? : Menu;

  userOptions : MenuItem[] = [
    {
      label : "View Profile",
      icon: "pi pi-user",
      command: () => this.viewProfile(),
      id: "opt-view-profile"
    },
    {
      label : "Add Contact",
      icon: "pi pi-user-plus",
      command: () => this.addContact(),
      id: "opt-add-contact"
    }
  ]; 

  contactOptions : MenuItem[] = [
    {
      label : "View Profile",
      icon: "pi pi-user",
      command: () => this.viewProfile(),
      id: "opt-view-profile"
    },
    {
      label : "Remove Contact",
      icon: "pi pi-user-minus",
      command: () => this.deleteContact(),
      id: "opt-remove-contact"
    }
  ];

  viewProfile(): void {
    const userId: number = this.user.userId;
    this.dialogService.open(UserProfileComponent, {
      context: {
        userId: userId
      }
    });
  }

  private addContact(){
    const contact : ContactForCreationDto = {
      UserId : this.authService.getUserIdFromSession(),
      ContactId : this.user.userId,
      StatusId : 2
    }
    this.contactService.addContact(contact)
    .subscribe({
      next: _ => {
        this.fetchContactInfo()
        this.toastrService.show('Success', `User successfully added to contacts`, { 
          position : NbGlobalPhysicalPosition.TOP_RIGHT,
          status : 'success',
          icon: 'checkmark'
        });
        this.contactUpdated.emit();
      },
      error : err => {
        this.errorHandlerService.handleError(err)
      }
    });
  }

  private deleteContact(){
    this.contactService.deleteContact(this.authService.getUserIdFromSession(), this.user.userId)
    .subscribe({
      next : _ => {
        this.fetchContactInfo();
        this.toastrService.show('Success', `User successfully remove from contacts.`, { 
          position : NbGlobalPhysicalPosition.TOP_RIGHT,
          status : 'success',
          icon: 'checkmark',
          // duration: 100000000
        });
        this.contactUpdated.emit();
      },
      error : err => {
        this.errorHandlerService.handleError(err)
      }
    });
  }

  viewMessages(user : UserDto){
    if(this.chatModuleService.isMobile){
      this.chatModuleService.hideChatlist()
    }
    this.router.navigate([`/chat/view/from-contacts/${user.userId}`]);
    
  }

  fetchContactInfo(){
    this.contactService.getActiveContactByUserIdContactId(this.authService.getUserIdFromSession(), this.user.userId)
    .subscribe({
      next: res => {
        this.contactInfo = res;
        this.options = res ? this.contactOptions : this.userOptions
      },
      error : err => this.errorHandlerService.handleError(err)
    })
  }

  public loadDisplayPicture() : string {
    return this.userProfileService.loadDisplayPicture(this.user.displayPictureUrl!, this.user.displayName);
  }

  public toggleMenu(ev : any){
    this.menu?.toggle(ev);
  }

  ngOnInit(){
    this.fetchContactInfo()
  }


}
