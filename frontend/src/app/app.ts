import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { RouterOutlet, RouterLink } from '@angular/router'; 
import { AuthService } from './services/auth'; // 

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink],// *ngIf için CommonModule, yönlendirme için RouterLink ve RouterOutlet
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  title = 'task-frontend';
  constructor(public authService: AuthService) {}// AuthService'i entegre ettik, public yaptık ki HTML'den erişebilelim

  //cıkıs yapma
  onLogout(): void {
    this.authService.logout();
  }

  get userName(): string | null {
    // Eğer 'name' "Ersin  G" gibiyse, sadece ilk adı alır.
    const fullName = this.authService.getCurrentUserName();
    if (!fullName) {
      return null;
    }
    return fullName.split(' ')[0]; // split fonk ile ilk ismi alır
  }

  isAdmin(): boolean {
    return this.authService.isAdmin();
  }
}