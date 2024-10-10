import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AuthService } from '../auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, OnDestroy {
  isLoading = false;
  authStatusSub: Subscription;

  constructor(public authSer: AuthService) {}

  ngOnInit(): void {
    this.authStatusSub = this.authSer.authStatusListener.subscribe(() => {
      this.isLoading = false;
    })
  }

  onLogin(loginForm: NgForm) {
    if (loginForm.invalid) {
      return
    }
    this.isLoading = true;
    this.authSer.userLogin(loginForm.value.email, loginForm.value.password);
  }

  ngOnDestroy(): void {
    this.authStatusSub.unsubscribe();
  }

}
