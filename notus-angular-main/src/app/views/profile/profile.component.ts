import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from "@angular/common/http";
import { AuthService } from './../../services/auth.service';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { NgForm } from '@angular/forms';
import * as _ from 'lodash';

@Component({
  selector: "app-profile",
  templateUrl: "./profile.component.html",
})
export class ProfileComponent implements OnInit {
  message: string;
  imageError: string;
  isImageSaved: boolean;
  cardImageBase64: string;
  isLogin: boolean = false;
  errorMessage;
  dubaiResult;
  objectId: string;
  title: string;
  description: string;
  short_info: string;
  long: number;
  lat: number;
  url: string;
  image: File;


  constructor(
    private activatedRoute: ActivatedRoute,
    private http: HttpClient,
    private _auth: AuthService,
    private _router: Router,
    private api: ApiService
  ) {
    this.activatedRoute.paramMap.subscribe(data => {
      this.objectId = data.get('id');

      this.http.get(`/dubai/${this.objectId}`).subscribe(data => {
        this.dubaiResult = data;
      });

    });
  }

  editProfile() {

  }

  onSubmit(form: NgForm) {
    let body = {
      objectId: this.objectId,
      title: this.title,
      description: this.description,
      short_info: this.short_info,
      long: this.long,
      lat: this.lat,
      url: this.url,
      image: this.image,
    };
    console.log('Your body data : ', body);

    this.api.putTypeRequest(`dubai/${this.objectId}`, body).subscribe((res: any) => {

      if (res.message === 'Updated successfully') {
        this.message = 'Edit was successful.'
      } else {
      }
    }, err => {
      this.errorMessage = err['error'].message;
    });

  }

  ngOnInit() {
    this.isUserLogin();
  }

  isUserLogin() {
    console.log(this._auth.getUserDetails());
    if (this._auth.getUserDetails() != null) {
      this.isLogin = true;
    }
  }

  logout() {
    this._auth.clearStorage();
    this._router.navigate(['/auth/login']);
  }

  fileChangeEvent(fileInput: any) {
    this.imageError = null;
    if (fileInput.target.files && fileInput.target.files[0]) {
      // Size Filter Bytes
      const max_size = 5242880;
      const allowed_types = ['image/png', 'image/jpeg'];
      const max_height = 15200;
      const max_width = 25600;

      if (fileInput.target.files[0].size > max_size) {
        this.errorMessage =
          'Maximum size allowed is ' + max_size / 1048576 + 'Mb';

        return false;
      }

      if (!_.includes(allowed_types, fileInput.target.files[0].type)) {
        this.errorMessage = 'Only Images are allowed ( JPG | PNG )';
        return false;
      }
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const image = new Image();
        image.src = e.target.result;
        image.onload = rs => {
          const img_height = rs.currentTarget['height'];
          const img_width = rs.currentTarget['width'];

          console.log(img_height, img_width);


          if (img_height > max_height && img_width > max_width) {
            this.errorMessage =
              'Maximum dimentions allowed ' +
              max_height +
              '*' +
              max_width +
              'px';
            return false;
          } else {
            const imgBase64Path = e.target.result;
            this.cardImageBase64 = imgBase64Path;
            this.isImageSaved = true;
            this.image = imgBase64Path;
            // this.previewImagePath = imgBase64Path;
          }
        };
      };

      reader.readAsDataURL(fileInput.target.files[0]);
    }
  }

  removeImage() {
    this.cardImageBase64 = null;
    this.isImageSaved = false;
  }
}
