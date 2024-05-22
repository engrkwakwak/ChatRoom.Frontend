import { NgModule } from '@angular/core';
import { BrowserModule, provideClientHydration } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NbButton, NbButtonModule, NbCardModule, NbIconModule, NbLayoutModule, NbListModule, NbMenuComponent, NbMenuModule, NbMenuService, NbSidebarModule, NbSidebarService, NbThemeModule, NbUserModule } from '@nebular/theme';
import { NbEvaIconsModule } from '@nebular/eva-icons';
import { HomeComponent } from './pages/home/home.component';
import { ChatModule } from './pages/chat/chat.module';
import { AuthModule } from './pages/auth/auth.module';
import { PageNotFoundComponent } from './pages/error/page-not-found/page-not-found.component';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    PageNotFoundComponent,
    
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
    AuthModule,
    HttpClientModule
  ],
  providers: [
    provideClientHydration(),
    NbSidebarService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
