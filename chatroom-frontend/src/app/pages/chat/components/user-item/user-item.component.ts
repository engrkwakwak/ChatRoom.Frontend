import { Component, Input } from '@angular/core';
import { UserDto } from '../../../../dtos/chat/user.dto';
import { UserProfileService } from '../../../../services/user-profile.service';

@Component({
  selector: 'app-user-item',
  templateUrl: './user-item.component.html',
  styleUrl: './user-item.component.scss'
})
export class UserItemComponent {
  @Input({ required: true }) user!: UserDto;

  constructor(
    private userProfileService: UserProfileService
  ){}

  public loadDisplayPicture() : string {
    return this.userProfileService.loadDisplayPicture(this.user.displayPictureUrl!, this.user.displayName);
  }
}

