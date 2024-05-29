import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-avatar',
  templateUrl: './avatar.component.html',
  styleUrl: './avatar.component.scss'
})
export class AvatarComponent {
  @Input({required : true}) src : string = "";
  @Input() width : number = 30;
  @Input() height : number = 30;

}
