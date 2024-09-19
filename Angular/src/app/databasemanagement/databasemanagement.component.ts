import {Component, OnInit } from '@angular/core';
@Component({
  selector: 'app-databasemanagement',
  templateUrl: './databasemanagement.component.html',
  styleUrls: ['./databasemanagement.component.css']
})
export class DatabasemanagementComponent implements OnInit {


  selectedIndex: string | number;
  ngOnInit() {
    this.selectedIndex =localStorage.getItem('userTabLocation') || 0;
  }

  handleMatTabChange(event: number) {
    localStorage.setItem('userTabLocation', event.toString());
}

}
