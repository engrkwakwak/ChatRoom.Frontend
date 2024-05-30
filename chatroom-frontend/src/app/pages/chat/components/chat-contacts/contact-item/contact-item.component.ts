import { Component, Input } from '@angular/core';
import { UserDto } from '../../../../../dtos/chat/user.dto';
import { MenuItem } from 'primeng/api';
import { ContactService } from '../../../../../services/contact.service';
import { ContactForCreationDto } from '../../../../../dtos/chat/contact-for-creation.dto';
import { UserProfileService } from '../../../../../services/user-profile.service';
import { AuthService } from '../../../../../services/auth.service';
import { NbGlobalPhysicalPosition, NbToastrService } from '@nebular/theme';
import { ErrorHandlerService } from '../../../../../services/error-handler.service';

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
    private errorHandlerService : ErrorHandlerService
  ){}

  @Input({required: true}) user : UserDto = {
    userId: 0,
    username: '',
    displayName: '',
    email: '',
    isEmailVerified: false
  }; 

  userOptions : MenuItem[] | undefined  = [
    { 
      label: 'View Profile',
      icon: 'pi pi-user'
    },
    { 
      label: 'Add Contact', 
      icon: 'pi pi-user-plus',
      command: () => this.addContact()
    },
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
        this.toastrService.show('Success', `User successfully added to contacts`, { 
          position : NbGlobalPhysicalPosition.TOP_RIGHT,
          status : 'success',
          icon: 'checkmark'
        });
      },
      error : err => {
        this.errorHandlerService.handleError(err)
      }
    });
  }

  ngOnInit(){
  }


}
