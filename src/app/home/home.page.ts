import { Component } from '@angular/core';
import { LocalNotifications } from '@capacitor/local-notifications';
@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage {
  twentyFive: number = 1 * 60;
  isOn: boolean = false;
  interval: any;
  //break: number = 5 * 60;

  constructor() {
    this.requestNotificationPermission();
  }

 

 async requestNotificationPermission() {
  const permission = await LocalNotifications.requestPermissions();
    if(permission.display !== 'granted') {
    alert('Notifications permission not granted');
    }
  }

   //notification trigger when time is up
  async notifyTimeIsUp(){
   await LocalNotifications.schedule({
    notifications: [
      {
      id: 1,
      title: 'Pomodoro Timer',
      body: 'Time is up',
      schedule: {at: new Date(Date.now() + 1000)},
      sound: 'default',
      smallIcon: 'ic_launcher',
      },
    ],
   });
  }

 
  

  

  
 

  started(){
    if (this.isOn) return;
    this.isOn = true;
    
    this.interval = setInterval(() => {
      if (this.twentyFive > 0){
        this.twentyFive--;
      } else {
        clearInterval(this.interval);
        this.notifyTimeIsUp();
        this.breakPeriod();
      }
    }, 1000);
  }

  breakPeriod(){
    this.twentyFive = 5 * 60;
    this.interval = setInterval(() => { 
    if(this.twentyFive > 0){
      this.twentyFive--;
    } else {
      clearInterval(this.interval);
      this.notifyTimeIsUp();
      this.twentyFive = 25 * 60;
      this.isOn = false;
      this.started();
    }
   },1000); 
  }

  formatTime(): string {
    const minutes = Math.floor(this.twentyFive / 60);
    const seconds = this.twentyFive % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
}
