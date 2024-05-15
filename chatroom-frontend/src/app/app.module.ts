import { NgModule } from '@angular/core';
import { BrowserModule, provideClientHydration } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NbButton, NbButtonModule, NbCardModule, NbIconModule, NbLayoutModule, NbListModule, NbMenuComponent, NbMenuModule, NbMenuService, NbSidebarModule, NbSidebarService, NbThemeModule, NbUserModule } from '@nebular/theme';
import { NbEvaIconsModule } from '@nebular/eva-icons';
import { HomeComponent } from './pages/home/home.component';
import { SigninComponent } from './pages/auth/signin/signin.component';
import { SignupComponent } from './pages/auth/signup/signup.component';
import { ChatComponent } from './pages/chat/chat.component';
import { NbMenuInternalService } from '@nebular/theme/components/menu/menu.service';
import { ChatIndexComponent } from './pages/chat/chat-index/chat-index.component';
import { ChatModule } from './pages/chat/chat.module';
import { AuthModule } from './pages/auth/auth.module';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NbThemeModule.forRoot({name: "dark"}),
    NbLayoutModule,
    NbButtonModule,
    NbEvaIconsModule,
    NbIconModule,
    ChatModule,
    AuthModule
  ],
  providers: [
    provideClientHydration(),
    NbSidebarService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
