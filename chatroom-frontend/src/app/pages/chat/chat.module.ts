import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatIndexComponent } from './chat-index/chat-index.component';
import { ChatComponent } from './chat.component';
import { NbActionsModule, NbButtonModule, NbCardModule, NbChatModule, NbCheckboxModule, NbContextMenuModule, NbDatepickerModule, NbDialogModule, NbDialogService, NbIconModule, NbInputModule, NbLayoutModule, NbListModule, NbPopoverModule, NbSpinnerModule, NbTabsetModule, NbTooltipModule, NbUserModule } from '@nebular/theme';
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
import { ProgressSpinnerModule  } from 'primeng/progressspinner';
import { UserSkeletonPlaceholderComponent } from './components/user-skeleton-placeholder/user-skeleton-placeholder.component';
import { MessageListComponent } from './components/message-list/message-list.component';
import { ChatlistItemComponent } from './components/chatlist/chatlist-item/chatlist-item.component';
import { ConfirmationDialogComponent } from './components/confirmation-dialog/confirmation-dialog.component';
import { UpdateMessageFormComponent } from './components/update-message-form/update-message-form.component';
import { ChatSettingsComponent } from './components/chat-settings/chat-settings.component';
import { CreateGroupChatModalComponent } from './components/create-group-chat-modal/create-group-chat-modal.component';
import { AddMembersModalComponent } from './components/add-members-modal/add-members-modal.component';
import { UserItemComponent } from './components/user-item/user-item.component';
import { ChatMembersComponent } from './components/chat-members/chat-members.component';
import { ChatMemberItemComponent } from './components/chat-member-item/chat-member-item.component';



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
    ChatlistItemComponent,
    ConfirmationDialogComponent,
    UpdateMessageFormComponent,
    ChatSettingsComponent,
    CreateGroupChatModalComponent,
    AddMembersModalComponent,
    UserItemComponent,
    ChatMembersComponent,
    ChatMemberItemComponent
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
    NbSpinnerModule,
    NbContextMenuModule,
    NbCardModule,
    ReactiveFormsModule,
    NbDatepickerModule,
    ProgressSpinnerModule,
    NbDialogModule.forRoot(),
    JwtModule.forRoot({
      config: {
        tokenGetter: tokenGetter,
        allowedDomains: ["localhost: 5001"],
        disallowedRoutes: []
      }
    }),
    SkeletonModule,
    MenuModule,
    NbDialogModule.forRoot(),
    NbCheckboxModule,
    NbTooltipModule,
    NbEvaIconsModule
  ]
})
export class ChatModule { }
