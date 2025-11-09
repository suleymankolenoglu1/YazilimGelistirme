import { Injectable } from '@angular/core';
//backend gelince burası degisecek 

export interface Task {
  id: number;
  title: string;
  description: string;
  category: string;
  status: 'pending' | 'overdue' | 'done'; 
  dueDate: string; 
  dueTime: string; 
}

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private nextId = 1;
  private mockTasks: Task[] = []; // sahte veri
  
  constructor() {
    this.seedTasks(); // Sahte verileri yükle
  }
  
  private seedTasks(): void {
    this.mockTasks = [
      { id: this.nextId++, title: 'Angular Arayüzü Bitir', description: 'Component\'leri ve servisleri oluştur.', category: 'Proje', status: 'pending', dueDate: '2025-11-10', dueTime: '18:00' },
      { id: this.nextId++, title: 'Market Alışverişi', description: 'Süt, ekmek, yumurta alınacak.', category: 'Ev', status: 'overdue', dueDate: '2025-11-07', dueTime: '19:00' },
      { id: this.nextId++, title: '.NET API\'sini bekle', description: 'Arkadaşın backend\'i bitirmesi lazım.', category: 'Proje', status: 'done', dueDate: '2025-11-06', dueTime: '15:00' },
      { id: this.nextId++, title: 'Spor Salonuna Git', description: 'Omuz antrenmanı.', category: 'Spor', status: 'pending', dueDate: '2025-11-09', dueTime: '19:00' }
    ];
  }

  getTasks(): Task[] {
    console.log("TaskService: Sahte veriler çekiliyor VE statüler güncelleniyor...");
    const updatedTasks = this.mockTasks.map(task => {
      const newStatus = this.calculateStatus(task.status, task.dueDate);
      
      return {
        ...task,       
        status: newStatus
      };
    });

    this.mockTasks = [...updatedTasks];
    return this.mockTasks;
  }

  
  addTask(task: Partial<Task>): void {
    const newId = this.nextId++; 
    const newStatus = this.calculateStatus(task.status, task.dueDate);

    const newTask: Task = {
      id: newId,
      title: task.title || 'Başlıksız Görev',
      description: task.description || '',
      category: task.category || 'Genel',
      status: newStatus,
      dueDate: task.dueDate || '',
      dueTime: task.dueTime || ''
    };

    this.mockTasks.push(newTask);
    console.log('TaskService: Yeni görev eklendi!', newTask);
  }


  updateTask(updatedTask: Task): void {
    const index = this.mockTasks.findIndex(t => t.id === updatedTask.id);
    
    if (index !== -1) {
      const newStatus = this.calculateStatus(updatedTask.status, updatedTask.dueDate);
      this.mockTasks[index] = {
        ...updatedTask, 
        status: newStatus 
      };
      
      console.log(`TaskService: ${updatedTask.id} ID'li görev güncellendi.`);
    }
  }

  deleteTask(id: number): void {
    this.mockTasks = this.mockTasks.filter(task => task.id !== id);
    console.log(`TaskService: ${id} ID'li görev silindi.`);
  }

 
  getTaskById(id: number): Task | undefined {
    const task = this.mockTasks.find(t => t.id === id);
    console.log(`TaskService: ${id} ID'li görev bulundu:`, task);
     return task;
  }
  
  
  getStats(): { total: number, done: number, overdue: number, pending: number } {
    let done = 0, overdue = 0, pending = 0;
    const total = this.mockTasks.length;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    for (const task of this.mockTasks) {
      const currentStatus = this.calculateStatus(task.status, task.dueDate);
      if (currentStatus === 'done') done++;
      else if (currentStatus === 'overdue') overdue++;
      else pending++;
    }
    return { total, done, overdue, pending };
  }


  getCategories(): string[] {
    const allCategories = this.mockTasks.map(task => task.category);
    const uniqueCategories = [...new Set(allCategories)].filter(c => c);
    return uniqueCategories;
  } 
  
  private calculateStatus(currentStatus: string | undefined, dueDateStr: string | undefined): 'done' | 'overdue' | 'pending' {
    
    
    if (currentStatus === 'done') {
      return 'done';
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (dueDateStr) {
      const dueDate = new Date(dueDateStr);
      dueDate.setHours(0, 0, 0, 0);
      
      if (dueDate < today) {
        return 'overdue'; 
      }
    }
    
    return 'pending'; 
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