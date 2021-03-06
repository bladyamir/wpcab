import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import{CommunicationService} from '../communication.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-sucess-page',
  templateUrl: './sucess-page.component.html',
  styleUrls: ['./sucess-page.component.css']
})
export class SucessPageComponent implements OnInit {
  path;
  constructor(private router: Router,private communicationService: CommunicationService,private ts: TranslateService) {
    let lan = this.getSelectedLanguage();
    this.ts.use(lan);
    this.notifyRoot();
    this.path = this.router.url;
    // console.log(this.path);
  }

  private getSelectedLanguage() {
    return localStorage.getItem('lan');
  }
  notifyRoot(){
    CommunicationService.navBar=false;
    this.communicationService.emitChange();
   }

  ngOnInit() {
  }

}
