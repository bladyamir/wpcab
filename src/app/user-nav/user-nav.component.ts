import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-nav',
  templateUrl: './user-nav.component.html',
  styleUrls: ['./user-nav.component.css']
})
export class UserNavComponent implements OnInit {
  routerLinks=[
    {
      label:'Home',
      link:'/home'
    },
    {
      label:'Profile',
      link:'/profile'
    },
    {
      label:'Finance',
      link:'/finance'
    },
    {
      label:'Notification',
      link:'/notification'
    }
  ]
  constructor(private router:Router) { }

  ngOnInit() {
  }

  logout(){
    this.router.navigateByUrl('login');
  }

}
