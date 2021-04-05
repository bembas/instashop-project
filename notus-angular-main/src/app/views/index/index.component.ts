import { Component, OnInit } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';


@Component({
  selector: "app-index",
  templateUrl: "./index.component.html"
})

export class IndexComponent implements OnInit {
  dubaiResults;

  constructor(
    private http: HttpClient,
    private router: Router,
    private api: ApiService
  ) { }


  getData() {
    // return this.http.get('/dubai');
    this.api.getTypeRequest('dubai')
  }

  ngOnInit() {
    this.http.get('/dubai').subscribe(data => {
      this.dubaiResults = data;
    });
  }

  dubaiDetails(dubai) {
    const url = '/profile/' + dubai.objectId;
    this.router.navigate([url]);
  }

}
