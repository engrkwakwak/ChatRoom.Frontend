import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatIndexComponent } from './chat-index/chat-index.component';
import { ChatComponent } from './chat.component';
import { NbActionsModule, NbButtonModule, NbCardModule, NbChatModule, NbContextMenuModule, NbDatepickerModule, NbDialogModule, NbDialogService, NbIconModule, NbInputModule, NbLayoutModule, NbListModule, NbPopoverModule, NbTabsetModule, NbUserModule } from '@nebular/theme';
import { NbEvaIconsModule } from '@nebular/eva-icons';
import { AppRoutingModule } from '../../app-routing.module';
import { ChatlistComponent } from './components/chatlist/chatlist.component';
import { ChatlistToggleComponent } from './components/chatlist-toggle/chatlist-toggle.component';
import { ChatViewComponent } from './chat-view/chat-view.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ChatSidebarComponent } from './components/chat-sidebar/chat-sidebar.component';
import { ChatContactsComponent } from './components/chat-contacts/chat-contacts.component';
import { NgxSpinner, NgxSpinnerModule } from 'ngx-spinner';
import { UserProfileComponent } from './components/user-profile/user-profile.component';
import { ReactiveFormsModule } from '@angular/forms';
import { JwtModule } from '@auth0/angular-jwt';
import { tokenGetter } from '../../app.module';
import { ContactItemComponent } from './components/chat-contacts/contact-item/contact-item.component';
import { AvatarComponent } from './components/avatar/avatar.component';
import { SkeletonModule } from 'primeng/skeleton';
import { MenuModule } from 'primeng/menu';
import { UserSkeletonPlaceholderComponent } from './components/user-skeleton-placeholder/user-skeleton-placeholder.component';
import { MessageListComponent } from './components/message-list/message-list.component';
import { ConfirmationDialogComponent } from './components/confirmation-dialog/confirmation-dialog.component';
import { UpdateMessageFormComponent } from './components/update-message-form/update-message-form.component';



@NgModule({
  declarations: [
    ChatComponent,
    ChatIndexComponent,
    ChatlistComponent,
    ChatlistToggleComponent,
    ChatViewComponent,
    ChatSidebarComponent,
    ChatContactsComponent,
    UserProfileComponent,
    ContactItemComponent,
    AvatarComponent,
    UserSkeletonPlaceholderComponent,
    MessageListComponent,
    ConfirmationDialogComponent,
    UpdateMessageFormComponent
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
    NgxSpinnerModule,
    NbContextMenuModule,
    NbCardModule,
    ReactiveFormsModule,
    NbDatepickerModule,
    NbDialogModule.forRoot(),
    JwtModule.forRoot({
      config: {
        tokenGetter: tokenGetter,
        allowedDomains: ["localhost: 5001"],
        disallowedRoutes: []
      }
    }),
    SkeletonModule,
    MenuModule
  ]
})
export class ChatModule { }
