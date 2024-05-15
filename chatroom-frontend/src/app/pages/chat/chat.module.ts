import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatIndexComponent } from './chat-index/chat-index.component';
import { ChatComponent } from './chat.component';
import { NbActionsModule, NbButtonModule, NbChatModule, NbIconModule, NbLayoutModule, NbListModule, NbUserModule } from '@nebular/theme';
import { NbEvaIconsModule } from '@nebular/eva-icons';
import { AppRoutingModule } from '../../app-routing.module';
import { ChatlistComponent } from './components/chatlist/chatlist.component';
import { ChatlistToggleComponent } from './components/chatlist-toggle/chatlist-toggle.component';
import { ChatViewComponent } from './chat-view/chat-view.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';



@NgModule({
  declarations: [
    ChatComponent,
    ChatIndexComponent,
    ChatlistComponent,
    ChatlistToggleComponent,
    ChatViewComponent
  ],
  imports: [
    AppRoutingModule,
    CommonModule,
    NbLayoutModule,
    NbButtonModule,
    NbEvaIconsModule,
    NbIconModule,
    NbUserModule,
    NbListModule,
    NbActionsModule,
    NbChatModule,
    BrowserAnimationsModule
  ],
})
export class ChatModule { }
