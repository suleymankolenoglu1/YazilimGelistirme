import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TaskService, Task, Attachment } from '../../services/task';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './task-list.html',
  styleUrl: './task-list.scss',
})
export class TaskListComponent implements OnInit {
  private allTasks: Task[] = [];
  public filteredTasks: Task[] = [];
  public selectedCategory: string = 'all';
  public selectedStatus: string = 'all'; // Yeni: Durum filtresi
  public categories: string[] = ['all'];
  public taskAttachments: { [taskId: number]: Attachment[] } = {};

  constructor(private taskService: TaskService) {}

  ngOnInit(): void {
    this.loadTasks();
  }

  // Task'ları backend'den yükle
  loadTasks(): void {
    this.taskService.getTasks().subscribe({
      next: (tasks) => {
        this.allTasks = tasks;
        this.filteredTasks = [...this.allTasks];
        console.log('TaskListComponent: Görevler yüklendi:', tasks);

        // Kategorileri çıkar
        this.updateCategories();
        
        // Her görevin attachment'larını yükle
        this.loadAllAttachments();
      },
      error: (error) => {
        console.error('Task yükleme hatası:', error);
        alert('Görevler yüklenemedi!');
      },
    });
  }

  // Tüm görevlerin dosyalarını yükle
  loadAllAttachments(): void {
    this.allTasks.forEach(task => {
      this.taskService.getAttachments(task.id).subscribe({
        next: (attachments) => {
          this.taskAttachments[task.id] = attachments;
        },
        error: () => {
          this.taskAttachments[task.id] = [];
        },
      });
    });
  }

  // Kategorileri güncelle
  updateCategories(): void {
    const uniqueCategories = [...new Set(this.allTasks.map((t) => t.category))];
    this.categories = ['all', ...uniqueCategories];
  }

  // Filtre değiştiğinde çağrılan fonksiyon
  onFilterChange(): void {
    console.log('Filtre değişti - Kategori:', this.selectedCategory, 'Durum:', this.selectedStatus);

    let result = [...this.allTasks];

    // Kategori filtresi
    if (this.selectedCategory !== 'all') {
      result = result.filter((task) => task.category === this.selectedCategory);
    }

    // Durum filtresi (completed/pending/overdue)
    if (this.selectedStatus === 'completed') {
      result = result.filter((task) => task.status === 'completed');
    } else if (this.selectedStatus === 'pending') {
      result = result.filter((task) => task.status !== 'completed' && !this.isOverdue(task));
    } else if (this.selectedStatus === 'overdue') {
      result = result.filter((task) => task.status !== 'completed' && this.isOverdue(task));
    }

    this.filteredTasks = result;
  }

  // Görev silme fonksiyonu
  onDelete(idToDelete: number): void {
    if (confirm('Bu görevi silmek istediğine emin misin?')) {
      this.taskService.deleteTask(idToDelete).subscribe({
        next: () => {
          console.log('Task silindi:', idToDelete);
          // Task'ları yeniden yükle
          this.loadTasks();
        },
        error: (error) => {
          console.error('Task silme hatası:', error);
          alert('Görev silinemedi!');
        },
      });
    }
  }

  // Yaklaşan tarihli mi? (overdue)
  isOverdue(task: Task): boolean {
    if (task.status === 'completed' || !task.dueDate) return false;

    const now = new Date();
    const dueDate = new Date(task.dueDate);

    if (task.dueTime) {
    // dueTime ör: "21:50"
    const [h, m] = task.dueTime.split(':');
    dueDate.setHours(Number(h), Number(m), 0, 0);
    }

    return dueDate < now;
  }

  isDueSoon(task: Task): boolean {
    if (task.status === 'completed' || !task.dueDate) return false;

    const today = new Date();
    const dueDate = new Date(task.dueDate);

    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(today.getDate() + 3);

    today.setHours(0, 0, 0, 0);
    dueDate.setHours(0, 0, 0, 0);
    threeDaysFromNow.setHours(0, 0, 0, 0);

    if (dueDate < today) return false;
    return dueDate <= threeDaysFromNow;
  }

  // Görev durumunu değiştirme fonksiyonu
  onToggleStatus(task: Task): void {
    const newStatus = task.status === 'completed' ? 'todo' : 'completed';

    this.taskService.updateTask(task.id, { status: newStatus }).subscribe({
      next: (updatedTask) => {
        console.log('Task durumu güncellendi:', updatedTask);
        // Task'ları yeniden yükle
        this.loadTasks();
      },
      error: (error) => {
        console.error('Task güncelleme hatası:', error);
        alert('Görev güncellenemedi!');
      },
    });
  }

  getTaskColorClass(task: Task): string {
    if (task.status === 'completed') {
      return 'task-completed';  // Yeşil
  }
    if (this.isOverdue(task)) {
      return 'task-overdue';    // Kırmızı
  }
      return 'task-pending';      // Sarı
  }

  // Attachment sayısını güvenli şekilde al
  getAttachmentCount(taskId: number): number {
    return this.taskAttachments[taskId]?.length || 0;
  }
}
