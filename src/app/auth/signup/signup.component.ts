import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AuthService } from '../auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit, OnDestroy {
  isLoading = false;
  authStatusSub: Subscription;
  hidePassword = true;

  constructor( public authSer: AuthService) {}

  ngOnInit(): void {
    this.authStatusSub = this.authSer.authStatusListener.subscribe(() => {
      this.isLoading = false;
    });
  }

  togglePasswordVisibility() {
    this.hidePassword = !this.hidePassword;
  }

  onSignUp(signupForm: NgForm) {
    if (signupForm.invalid) {
      return;
    }
    this.isLoading = true;
    this.authSer.addNewUser(signupForm.value.email, signupForm.value.password);
  }

  ngOnDestroy(): void {
    this.authStatusSub.unsubscribe();
  }

}
