import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { Router, RouterLink } from '@angular/router'; // <-- Yönlendirme ve Link için
import { AuthService } from '../../services/auth'; // Auth 

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink], 
  templateUrl: './register.html',
  styleUrl: './register.scss'
})
export class Register { 

  
  public userData = {
    username: '',
    fullName: '',
    email: '', 
    password: ''
  };

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  onSubmit(): void {
    console.log('Register formu gönderildi:', this.userData);
    const isSuccess = this.authService.register(this.userData);

    if (isSuccess) {
      alert('Kayıt başarılı! Giriş sayfasına yönlendiriliyorsunuz.');
      this.router.navigate(['/login']);
    }
    
  }

}