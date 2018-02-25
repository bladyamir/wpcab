import { Component, OnInit } from '@angular/core';
import {Validators,FormBuilder,FormGroup} from "@angular/forms"
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  searchForm:FormGroup;
  activeUserRole;
  constructor(private builder:FormBuilder) { }

  ngOnInit() {
    this.activeUserRole=localStorage.getItem('activeUserRole');
  }

}