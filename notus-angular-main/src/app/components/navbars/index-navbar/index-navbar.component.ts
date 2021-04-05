import { Component, OnInit } from '@angular/core';
import { AuthService } from './../../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: "app-index-navbar",
  templateUrl: "./index-navbar.component.html",
})
export class IndexNavbarComponent implements OnInit {
  navbarOpen = false;

  isLogin: boolean = false;
  errorMessage;
  constructor(
    private _auth: AuthService,
    private _router: Router
  ) { }

  ngOnInit() {
    this.isUserLogin();
  }

  isUserLogin() {
    console.log(this._auth.getUserDetails());
    if (this._auth.getUserDetails() != null) {
      this.isLogin = true;
    }
    console.log('is login');
    console.log(this.isLogin);
  }

  logout() {
    this._auth.clearStorage();
    this._router.navigate(['/auth/login']);
  }

  setNavbarOpen() {
    this.navbarOpen = !this.navbarOpen;
  }
}
