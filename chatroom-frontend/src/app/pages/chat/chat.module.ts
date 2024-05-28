import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatIndexComponent } from './chat-index/chat-index.component';
import { ChatComponent } from './chat.component';
import { NbActionsModule, NbButtonModule, NbChatModule, NbIconModule, NbInputModule, NbLayoutModule, NbListModule, NbPopoverModule, NbTabsetModule, NbUserModule } from '@nebular/theme';
import { NbEvaIconsModule } from '@nebular/eva-icons';
import { AppRoutingModule } from '../../app-routing.module';
import { ChatlistComponent } from './components/chatlist/chatlist.component';
import { ChatlistToggleComponent } from './components/chatlist-toggle/chatlist-toggle.component';
import { ChatViewComponent } from './chat-view/chat-view.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ChatSidebarComponent } from './components/chat-sidebar/chat-sidebar.component';
import { ChatContactsComponent } from './components/chat-contacts/chat-contacts.component';
import { NgxSpinner, NgxSpinnerModule } from 'ngx-spinner';



@NgModule({
  declarations: [
    ChatComponent,
    ChatIndexComponent,
    ChatlistComponent,
    ChatlistToggleComponent,
    ChatViewComponent,
    ChatSidebarComponent,
    ChatContactsComponent
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
    BrowserAnimationsModule,
    NbTabsetModule,
    NbInputModule,
    NbPopoverModule,
    NgxSpinnerModule
  ],
})
export class ChatModule { }
