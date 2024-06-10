import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { HomeComponent } from './pages/home/home.component';
import { SigninComponent } from './pages/auth/signin/signin.component';
import { SignupComponent } from './pages/auth/signup/signup.component';
import { ChatComponent } from './pages/chat/chat.component';
import { ChatIndexComponent } from './pages/chat/chat-index/chat-index.component';
import { ChatViewComponent } from './pages/chat/chat-view/chat-view.component';
import { PageNotFoundComponent } from './pages/error/page-not-found/page-not-found.component';
import { AuthGuard } from './guards/auth.guard';
import { EmailVerificationComponent } from './pages/auth/email-verification/email-verification.component';
import { EmailVerifiedGuard } from './guards/email-verified.guard';
import { EmailVerifiedComponent } from './pages/auth/email-verified/email-verified.component';
import { ChatGuard } from './guards/chat.guard';

const routes: Routes = [
  {path: "", component: HomeComponent},
  {path: "home", redirectTo: ""},
  {path: "signin", component: SigninComponent, canActivate: [AuthGuard]},
  {path: "signup", component: SignupComponent, canActivate: [AuthGuard]},
  {path: "email-verification", component: EmailVerificationComponent, canActivate: [AuthGuard, EmailVerifiedGuard]}, 
  {path: "email-verified", component: EmailVerifiedComponent}, 
  {
    path: "chat", 
    component: ChatComponent,
    children: [
      { path: "", component: ChatIndexComponent },
      { 
        path: "view", 
        children: [
          { path : "from-contacts/:userId", component : ChatViewComponent },
          { path: "from-chatlist/:chatId", component: ChatViewComponent, canActivate: [ChatGuard] },
        ]
      }
    ],
    canActivate: [AuthGuard, EmailVerifiedGuard]
  },

  {path: "**", component: PageNotFoundComponent},
  {
    path: "error",
    children: [
      {
        path: "404", component: PageNotFoundComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
