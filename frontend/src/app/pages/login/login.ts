import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  public userData = {
    username: '',
    password: '',
  };

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit(): void {
    console.log('Login formu gönderildi:', this.userData);

    // SUBSCRIBE EKLENDI - HTTP isteğini bekle
    this.authService.login(this.userData.username, this.userData.password).subscribe({
      next: (response) => {
        console.log('Login başarılı, token:', response.token);
        alert('Giriş başarılı! Ana sayfaya yönlendiriliyorsunuz.');
        this.router.navigate(['/']);
      },
      error: (error) => {
        console.error('Login hatası:', error);
        alert('Giriş başarısız! Kullanıcı adı veya şifre hatalı.');
      },
    });
  }
}
