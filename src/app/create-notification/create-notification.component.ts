import { Component, OnInit } from '@angular/core';
import{CommunicationService} from '../communication.service';

@Component({
  selector: 'app-create-notification',
  templateUrl: './create-notification.component.html',
  styleUrls: ['./create-notification.component.css']
})
export class CreateNotificationComponent implements OnInit {
  activeUserRole;
  constructor(private communicationService: CommunicationService) {
    
   }

  ngOnInit() {
    this.activeUserRole=localStorage.getItem('activeUserRole');
  }
}
