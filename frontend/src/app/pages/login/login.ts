import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { Router, RouterLink } from '@angular/router'; // yönlendirme ve link için
import { AuthService } from '../../services/auth';//auth servisi 

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink], 
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login { 

  public userData = {
    username: '', 
    password: ''
  };
  
  constructor(
    private authService: AuthService,
    private router: Router
  ) { }


  onSubmit(): void {
    console.log('Login formu gönderildi:', this.userData);
    const isSuccess = this.authService.login(
      this.userData.username, 
      this.userData.password
    );

    if (isSuccess) {
      alert('Giriş başarılı! Ana sayfaya yönlendiriliyorsunuz.');
      this.router.navigate(['/']);
    } 
    
  }

}
