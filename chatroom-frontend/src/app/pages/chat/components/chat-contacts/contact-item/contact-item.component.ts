import { Component, EventEmitter, Input, Output } from '@angular/core';
import { UserDto } from '../../../../../dtos/chat/user.dto';
import { MenuItem } from 'primeng/api';
import { ContactService } from '../../../../../services/contact.service';
import { ContactForCreationDto } from '../../../../../dtos/chat/contact-for-creation.dto';
import { AuthService } from '../../../../../services/auth.service';
import { NbGlobalPhysicalPosition, NbToastrService } from '@nebular/theme';
import { ErrorHandlerService } from '../../../../../services/error-handler.service';
import { ContactDto } from '../../../../../dtos/chat/contact.dto';
import { emit } from 'process';
import { UserProfileService } from '../../../../../services/user-profile.service';

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
    private userProfileService : UserProfileService
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

  userOptions : MenuItem[] = [
    {
      label : "View Profile",
      icon: "pi pi-user"
    },
    {
      label : "Add Contact",
      icon: "pi pi-user-plus",
      command: () => this.addContact()
    }
  ]; 

  contactOptions : MenuItem[] = [
    {
      label : "View Profile",
      icon: "pi pi-user"
    },
    {
      label : "Remove Contact",
      icon: "pi pi-user-minus",
      command: () => this.deleteContact()
    }
  ]; 

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
          icon: 'checkmark'
        });
        this.contactUpdated.emit();
      },
      error : err => {
        this.errorHandlerService.handleError(err)
      }
    });
  }

  fetchContactInfo(){
    this.contactService.getActiveContactByUserIdContactId(this.authService.getUserIdFromSession(), this.user.userId)
    .subscribe({
      next: res => {
        this.contactInfo = res;
      },
      error : err => this.errorHandlerService.handleError(err)
    })
  }

  public loadDisplayPicture() : string {
    return this.userProfileService.loadDisplayPicture(this.user.displayPictureUrl!, this.user.displayName);
  }

  ngOnInit(){
    this.fetchContactInfo()
  }


}