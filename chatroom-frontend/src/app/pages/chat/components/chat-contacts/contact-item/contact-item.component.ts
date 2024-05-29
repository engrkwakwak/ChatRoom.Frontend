import { Component, Input } from '@angular/core';
import { UserDto } from '../../../../../dtos/chat/user.dto';

@Component({
  selector: 'app-contact-item',
  templateUrl: './contact-item.component.html',
  styleUrl: './contact-item.component.scss'
})
export class ContactItemComponent {
  @Input({required: true}) user : UserDto = {
    userId: 0,
    username: '',
    displayName: '',
    email: '',
    isEmailVerified: false
  }; 

  ngOnInit(){
    // console.log(this.user)
  }

}
