import { Component, OnInit } from "@angular/core";
import { IndexComponent } from "./views/index/index.component";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
})
export class AppComponent implements OnInit {
  title = "angular-dashboard-page";
  dubaiResults;

  constructor(private dubai: IndexComponent) {
  }


  ngOnInit() {
    this.getDataFromApi();
  }

  getDataFromApi() {
    this.dubaiResults = this.dubai.getData();
  }

}
