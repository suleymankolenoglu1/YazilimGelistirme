import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';
import { TaskService, Task } from '../../services/task';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';

interface User {
  id: number;
  fullName: string;
  username: string;
  email: string;
  role: string;
  createdAt: string;
}

@Component({
  selector: 'app-admin-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-panel.html',
  styleUrl: './admin-panel.scss'
})
export class AdminPanelComponent implements OnInit {
  users: User[] = [];
  selectedUser: User | null = null;
  userTasks: Task[] = [];
  showAssignForm = false;

  // Yeni görev formu
  newTask = {
    title: '',
    description: '',
    category: 'Genel',
    dueDate: '',
    dueTime: ''
  };

  categories = ['Genel', 'İş', 'Kişisel', 'Alışveriş', 'Sağlık', 'Eğitim'];

  private apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private taskService: TaskService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Admin değilse çık
    if (!this.authService.isAdmin()) {
      alert('Bu sayfaya erişim yetkiniz yok!');
      this.router.navigate(['/tasks']);
      return;
    }
    this.loadUsers();
  }

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  loadUsers(): void {
    this.http.get<User[]>(`${this.apiUrl}/api/auth/users`, { headers: this.getHeaders() })
      .subscribe({
        next: (users) => {
          this.users = users;
        },
        error: (err) => {
          console.error('Kullanıcılar yüklenemedi:', err);
          alert('Kullanıcılar yüklenirken hata oluştu!');
        }
      });
  }

  selectUser(user: User): void {
    this.selectedUser = user;
    this.showAssignForm = false;
    this.loadUserTasks(user.id);
  }

  loadUserTasks(userId: number): void {
    this.http.get<Task[]>(`${this.apiUrl}/api/task/user/${userId}`, { headers: this.getHeaders() })
      .subscribe({
        next: (tasks) => {
          this.userTasks = tasks;
        },
        error: (err) => {
          console.error('Görevler yüklenemedi:', err);
          this.userTasks = [];
        }
      });
  }

  toggleAssignForm(): void {
    this.showAssignForm = !this.showAssignForm;
    if (this.showAssignForm) {
      this.resetNewTask();
    }
  }

  resetNewTask(): void {
    this.newTask = {
      title: '',
      description: '',
      category: 'Genel',
      dueDate: '',
      dueTime: ''
    };
  }

  assignTask(): void {
    if (!this.selectedUser || !this.newTask.title) {
      alert('Lütfen görev başlığı girin!');
      return;
    }

    this.http.post(`${this.apiUrl}/api/task/assign/${this.selectedUser.id}`, this.newTask, { headers: this.getHeaders() })
      .subscribe({
        next: () => {
          alert('Görev başarıyla atandı!');
          this.showAssignForm = false;
          this.loadUserTasks(this.selectedUser!.id);
          this.resetNewTask();
        },
        error: (err) => {
          console.error('Görev atanamadı:', err);
          alert('Görev atanırken hata oluştu!');
        }
      });
  }

  getTaskColorClass(task: Task): string {
    if (task.status === 'completed') return 'task-completed';
    if (this.isOverdue(task)) return 'task-overdue';
    return 'task-pending';
  }

  isOverdue(task: Task): boolean {
  if (task.status === 'completed' || !task.dueDate) return false;
  const now = new Date();
  const dueDate = new Date(task.dueDate);

  // Eğer saat bilgisi varsa onu da ekle
  if (task.dueTime) {
    const [h, m] = task.dueTime.split(':');
    dueDate.setHours(Number(h), Number(m), 0, 0);
  } else {
    dueDate.setHours(23, 59, 59, 999); // Saat yoksa gün sonu
  }

  return dueDate < now;
  }
}