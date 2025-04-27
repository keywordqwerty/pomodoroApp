import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage {
  twentyFive: number = 25*60;
  isOn: boolean = false;
  interval: any;

  constructor() {}
  
  started(){
    if (this.isOn) return;
    this.isOn = true;
    
    this.interval = setInterval(() => {
      if (this.twentyFive > 0){
        this.twentyFive--;
      } else {
        clearInterval(this.interval);
        this.isOn = false;
        alert('Time is up');
      }
    }, 1000);
  }

  formatTime(): string {
    const minutes = Math.floor(this.twentyFive / 60);
    const seconds = this.twentyFive % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
}
