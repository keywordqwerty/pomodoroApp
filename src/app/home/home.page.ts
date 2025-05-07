import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Haptics } from '@capacitor/haptics';
import { App } from '@capacitor/app';
import { Platform } from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone:false
})
export class HomePage implements OnInit, OnDestroy {
  workDuration = 10;     // seconds for testing
  breakDuration = 10;    // seconds for testing
  timeLeft!: number;
  isOn = false;
  isBreak = false;
  currentTime = '';
  private intervalId!: any;
  private alarmAudio = new Audio('assets/sounds/alert.mp3');

  constructor(private zone: NgZone, private platform: Platform) {
    this.platform.ready().then(async () => {
      await LocalNotifications.requestPermissions();
      await LocalNotifications.createChannel({
        id: 'pomodoro-channel',
        name: 'Pomodoro Alerts',
        importance: 5
      });
    });
    this.initBackButton();
  }

  ngOnInit() {
    this.timeLeft = this.workDuration;
    this.updateClock();
    setInterval(() => this.updateClock(), 1000);
  }

  ngOnDestroy() {
    clearInterval(this.intervalId);
  }

  private updateClock() {
    this.currentTime = new Date().toLocaleTimeString();
  }

  startPomodoro() {
    console.log('▶️ startPomodoro, wasOn=', this.isOn);
    if (this.isOn) return;

    this.isOn = true;
    this.isBreak = false;
    this.timeLeft = this.workDuration;
    console.log('   → timeLeft initialized to', this.timeLeft);
    this.runTimer();
  }

  private runTimer() {
    this.intervalId = setInterval(() => {
      this.zone.run(() => {
        this.timeLeft--;
        console.log('⏱ tick, timeLeft=', this.timeLeft);

        if (this.timeLeft <= 0) {
          clearInterval(this.intervalId);
          this.handlePhaseEnd();
        }
      });
    }, 1000);
  }

  private async handlePhaseEnd() {
    console.log('🔔 phase ended, isBreak=', this.isBreak);

    // play in-app sound (non-blocking)
    this.alarmAudio.currentTime = 0;
    this.alarmAudio.play().catch(e => console.warn('Audio failed:', e));

    // native notification
    LocalNotifications.schedule({
      notifications: [{
        id: Date.now(),
        title: 'Pomodoro Timer',
        body: this.isBreak ? 'Break over!' : 'Work over!',
        schedule: { at: new Date() },
        channelId: 'pomodoro-channel',
      }]
    }).catch(e => console.warn('Notification failed:', e));

    // vibrate
    Haptics.vibrate().catch(e => console.warn('Vibrate failed:', e));

    if (!this.isBreak) {
      this.isBreak = true;
      this.timeLeft = this.breakDuration;
      console.log('   → entering BREAK, timeLeft=', this.timeLeft);
      this.runTimer();
    } else {
      this.isOn = false;
      this.timeLeft = this.workDuration;  // reset display
      console.log('   ✔️ cycle complete, button re-enabled');
    }
  }

  formatTime(): string {
    const m = Math.floor(this.timeLeft / 60).toString().padStart(2,'0');
    const s = (this.timeLeft % 60).toString().padStart(2,'0');
    return `${m}:${s}`;
  }

  private initBackButton() {
    App.addListener('backButton', () => {
      if (window.history.length > 1) {
        window.history.back();
      } else {
        App.exitApp();
      }
    });
  }
}