import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { AuthData } from './authData.model';
import { environment } from "../../environments/environment";
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { Router } from '@angular/router';

const url = environment.apiURL + "/users/";

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private token: string;
  private userAuthStatus = false;
  private userId: string;
  expireTimeOut: number;
  expireTimer: any;
  public authStatusListener = new BehaviorSubject(false);

  constructor(private http: HttpClient, private router: Router) { }

  getToken() {
    return this.token;
  }

  getAuthStatus() {
    return this.userAuthStatus;
  }

  getUserId() {
    return this.userId;
  }

  addNewUser(email: string, password: string) {
    const authData: AuthData = {
      email: email,
      password: password
    };
    this.http.post<{ message: string, user }>(url + "signup", authData).subscribe({
      next: () => this.router.navigate(['/']),
      error: (e) => this.authStatusListener.next(false)
      });
  }

  userLogin(email: string, password: string) {
    const authData: AuthData = {
      email: email,
      password: password
    };
    this.http.post<{ token: string, expiresIn: number, userId: string }>(url + "login", authData).subscribe({
      next: (res) => {
        this.token = res.token;
        if (this.token) {
          this.expireTimeOut = res.expiresIn;
          this.setAuthTimer(this.expireTimeOut);
          this.userAuthStatus = true;
          this.userId = res.userId;
          this.authStatusListener.next(true);
          const now = new Date();
          const expirationDate = new Date(now.getTime() + this.expireTimeOut * 1000);
          this.setAuthData(this.token, expirationDate, this.userId);
          this.router.navigate(['/']);
        }
      },
      error: () => this.authStatusListener.next(false)
    });
  }

  logout() {
    this.token = null;
    this.userAuthStatus = false;
    this.userId = null;
    this.authStatusListener.next(false);
    clearTimeout(this.expireTimer);
    this.clearAuthData();
    this.router.navigate(['/']);
  }

  private setAuthData(token: string, expireDate: Date, userId: string) {
    localStorage.setItem('token', token);
    localStorage.setItem('expiration', expireDate.toISOString());
    localStorage.setItem('userId', userId)
  }

  private clearAuthData() {
    localStorage.removeItem('token');
    localStorage.removeItem('expiration');
    localStorage.removeItem('userId');
  }

  private getUserAuthData() {
    const token = localStorage.getItem('token');
    const expire = localStorage.getItem('expiration');
    const userId = localStorage.getItem('userId');
    if(!token || !expire) {
      return;
    }
    return {
      token: token,
      expires: new Date(expire),
      userId: userId
    };
  }

  private setAuthTimer(duration) {
    console.log('timer', duration)
    this.expireTimer = setTimeout(() => {
      this.logout();
    }, duration * 1000);
  }

  autoAuthInfo() {
    const authInfo = this.getUserAuthData();
    if(!authInfo) {
      return;
    }
    const now = new Date();
    const expiresIn = authInfo.expires.getTime() - now.getTime();
    if(expiresIn > 0) {
      this.token = authInfo.token;
      this.userAuthStatus = true;
      this.userId = authInfo.userId;
      this.setAuthTimer(expiresIn/1000);
      this.authStatusListener.next(true);
    }
  }

}
