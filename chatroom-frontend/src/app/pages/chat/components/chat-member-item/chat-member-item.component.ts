import { Component, Input, ViewChild, input } from '@angular/core';
import { ChatMemberDto } from '../../../../dtos/chat/chat-member.dto';
import { UserProfileService } from '../../../../services/user-profile.service';
import { Menu } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { NbMenuItem, NbMenuService } from '@nebular/theme';
import { filter, map } from 'rxjs';
import { FormBuilder, FormGroup } from '@angular/forms';
import { UserDto } from '../../../../dtos/chat/user.dto';

@Component({
  selector: 'app-chat-member-item',
  templateUrl: './chat-member-item.component.html',
  styleUrl: './chat-member-item.component.scss'
})
export class ChatMemberItemComponent {
  
  constructor(
    private userProfileService : UserProfileService,
    private nbMenuService : NbMenuService
  ){}
  
  userId? : number;
  @Input({required:true}) type : string = "member";
  @Input() member? : ChatMemberDto;
  @Input() user? : UserDto;
  @ViewChild("menu") menu? : Menu;


  ngOnInit(): void {
    this.userId = this.userProfileService.getUserIdFromToken()
    this.nbMenuService.onItemClick()
      .pipe(
        filter(({ tag  }) => tag === 'user-actions-menu'),
        map(({ item: { title } }) => title),
      )
      .subscribe(title => {
        if(title === 'Remove Member'){
          // this.logOut();
        }
        if(title === 'Set as Admin'){
          // this.logOut();
        }
      });
  }

  memberOptions : NbMenuItem[] = [
    {
      title: "Remove Member",
      icon : "person-remove"
    },
    {
      title: "Set as Admin",
      icon: "lock"
    }
  ]


  loadProfilePicture(){
    return this.type =='member' ? 
            this.userProfileService.loadDisplayPicture(this.member?.user!.displayPictureUrl!, this.member?.user.displayName!)
            : this.userProfileService.loadDisplayPicture(this.user?.displayPictureUrl!, this.user?.displayName!)
  }

}
