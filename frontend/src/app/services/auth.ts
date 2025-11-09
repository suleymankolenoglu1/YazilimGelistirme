import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';

export interface User {
  id: number;
  fullName: string;
  username: string;
  email: string;
  passwordHash: string; 
}
//backend baglanınca buralardaki kodlar degisecek en aşağıda örnek var
// auth task ve app.config dosyalarında backend entegrasyonu için yapılacakları ekledim


//auth servisi = kimlik doğrulama servisi
@Injectable({
  providedIn: 'root'
})
export class AuthService { 

  
  private users: User[] = [];
  private nextId = 1;

 
  private isLoggedIn = false;
  private loggedInUserName: string | null = null;
  private router = inject(Router);

  constructor() { }

  private fakeHash (password: string): string {
    return password.split('').reverse().join('') + '_HASHED';
  }
  
  
  private verifyFakeHash(password: string, storedHash: string): boolean {
    return this.fakeHash(password) === storedHash;
  }

  register(model: any): boolean {
    
    const existingUser = this.users.find(u => u.username.toLowerCase() === model.username.toLowerCase());
    
    if (existingUser) {
      console.log('AuthService: Bu kullanıcı adı zaten kayıtlı!', model.username);
      alert('Hata: Bu kullanıcı adı zaten kullanılıyor.');
      return false; 
    }
    
    const existingEmail = this.users.find(u => u.email.toLowerCase() === model.email.toLowerCase());
    if (existingEmail) {
      console.log('AuthService: Bu email zaten kayıtlı!', model.email);
      alert('Hata: Bu email adresi zaten kullanılıyor.');
      return false; 
    }

    const passwordHash = this.fakeHash(model.password);

    const newUser: User = {
      id: this.nextId++,
      fullName: model.fullName, 
      username: model.username, 
      email: model.email,     
      passwordHash: passwordHash
    };
    
    this.users.push(newUser);
    console.log('AuthService: Yeni kullanıcı kayıt oldu!', newUser);
    console.log('Tüm Kullanıcılar (Depo):', this.users);
    return true;
  }

  login(username: string, pass: string): boolean {
    
    const user = this.users.find(u => u.username.toLowerCase() === username.toLowerCase());
    
    if (user) {
      if (this.verifyFakeHash(pass, user.passwordHash)) {
        console.log('AuthService: Giriş başarılı!', user);
        this.isLoggedIn = true; 
        this.loggedInUserName = user.fullName; 
        
        return true;
      }
    }
    
    console.log('AuthService: Giriş başarısız! (Kullanıcı adı veya şifre hatalı)');
    alert('Kullanıcı adı veya şifre hatalı!');
    this.isLoggedIn = false;
    return false; 
  }

  logout(): void {
    this.isLoggedIn = false;
    this.loggedInUserName = null;
    console.log('AuthService: Çıkış yapıldı.');
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    return this.isLoggedIn;
  }

  getCurrentUserName(): string | null {
    return this.loggedInUserName;
  }
}

/*
BACKEND ENTEGRASYONU İÇİN YAPILACAKLAR:

1. Bu mock servis yerine gerçek API çağrıları yapacak servis yazılmalı.
   Örnek kod:

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(private http: HttpClient) {}
  
  login(username: string, password: string): Observable<any> {
    return this.http.post(`${environment.apiUrl}/api/auth/login`, {
      username, password
    }).pipe(
      tap(response => {
        if (response.token) {
          localStorage.setItem('token', response.token);
        }
      })
    );
  }

  register(model: any): Observable<any> {
    return this.http.post(`${environment.apiUrl}/api/auth/register`, model);
  }

  logout(): void {
    localStorage.removeItem('token');
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }
}

2. environment.ts dosyası oluşturulmalı:
export const environment = {
  production: false,
  apiUrl: 'http://localhost:5000' // Backend URL'i
};

3. HttpClient için app.config.ts'de provider eklenecek
*/