import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

export interface Task {
  id: number;
  title: string;
  description: string;
  category: string;
  status: string;
  dueDate: string;
  dueTime: string;
  userId?: number;
  createdAt?: string;
  lastModified?: string;
  attachmentPath?: string;
}

export interface Attachment {
  id: number;
  originalFileName: string;
  fileSizeFormatted: string;
  uploadDate: string;
}

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  private apiUrl = `${environment.apiUrl}/api/Task`;
  private http = inject(HttpClient);

  // Tüm task'ları getir
  getTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.apiUrl}/tasks`);
  }

  // Yeni task ekle
  addTask(task: Partial<Task>): Observable<Task> {
    return this.http.post<Task>(`${this.apiUrl}/tasks`, task);
  }

  // Task güncelle
  updateTask(id: number, task: Partial<Task>): Observable<Task> {
    return this.http.put<Task>(`${this.apiUrl}/tasks/${id}`, task);
  }

  // Task sil
  deleteTask(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/tasks/${id}`);
  }

  // İstatistikleri getir
  getStats(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/tasks/stats`);
  }

  // Kategori bazlı istatistikleri getir
  getCategoryStats(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/api/Attachment/stats`);
  }

  // Kategorileri getir (task'lardan otomatik)
  getCategories(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/tasks/categories`);
  }

  // ===== ATTACHMENT (DOSYA) İŞLEMLERİ =====
  private attachmentUrl = `${environment.apiUrl}/api/Attachment`;

  // Dosya yükle
  uploadFile(taskId: number, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.attachmentUrl}/tasks/${taskId}`, formData);
  }

  // Görevin dosyalarını listele
  getAttachments(taskId: number): Observable<Attachment[]> {
    return this.http.get<Attachment[]>(`${this.attachmentUrl}/tasks/${taskId}`);
  }

  // Dosya indir (URL döndür)
  getDownloadUrl(attachmentId: number): string {
    return `${this.attachmentUrl}/${attachmentId}`;
  }

  // Dosya indir (blob olarak - token ile)
  downloadFile(attachmentId: number): Observable<Blob> {
    return this.http.get(`${this.attachmentUrl}/${attachmentId}`, {
      responseType: 'blob'
    });
  }

  // Dosya sil
  deleteAttachment(attachmentId: number): Observable<void> {
    return this.http.delete<void>(`${this.attachmentUrl}/${attachmentId}`);
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

export interface Task {
  id: number;
  title: string;
  description: string;
  category: string;
  status: 'pending' | 'overdue' | 'done';
  dueDate: string;
  dueTime: string;
}

@Injectable({ providedIn: 'root' })
export class TaskService {
  private apiUrl = `${environment.apiUrl}/api/tasks`;
  
  constructor(private http: HttpClient) {}
  
  getTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(this.apiUrl);
  }
  
  addTask(task: Partial<Task>): Observable<Task> {
    return this.http.post<Task>(this.apiUrl, task);
  }
  
  updateTask(task: Task): Observable<Task> {
    return this.http.put<Task>(`${this.apiUrl}/${task.id}`, task);
  }
  
  deleteTask(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
  
  getStats() {
    return this.http.get<any>(`${this.apiUrl}/stats`);
  }
}

2. Backend API endpoint'leri:
   GET    /api/tasks         - Tüm görevleri listele
   POST   /api/tasks         - Yeni görev ekle
   PUT    /api/tasks/:id     - Görev güncelle
   DELETE /api/tasks/:id     - Görev sil
   GET    /api/tasks/stats   - İstatistikleri al
*/
