import { Component, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  authStatusSub: Subscription
  isUserAuthenticated = false;
  constructor(private authSer: AuthService) {}

  ngOnInit(): void {
    this.authStatusSub = this.authSer.authStatusListener.subscribe(val => {
      this.isUserAuthenticated = val;
    });
  }

  onLogout() {
    this.authSer.logout();
  }

  ngOnDestroy(): void {
    this.authStatusSub.unsubscribe();
  }

}
