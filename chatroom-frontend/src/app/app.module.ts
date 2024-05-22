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
import { ReactiveFormsModule } from '@angular/forms';
import { JwtModule } from '@auth0/angular-jwt';
import { provideHttpClient, withFetch } from '@angular/common/http';

export function tokenGetter() {
  return localStorage.getItem("chatroom-token");
}


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
    ReactiveFormsModule,
    JwtModule.forRoot({
      config: {
        tokenGetter: tokenGetter,
        allowedDomains: ["localhost: 5001"],
        disallowedRoutes: []
      }
    })
  ],
  providers: [
    provideClientHydration(),
    NbSidebarService,
    provideHttpClient(withFetch())
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
