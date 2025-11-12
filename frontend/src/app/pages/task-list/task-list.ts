import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TaskService, Task } from '../../services/task';

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
  public categories: string[] = ['all'];

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
      },
      error: (error) => {
        console.error('Task yükleme hatası:', error);
        alert('Görevler yüklenemedi!');
      },
    });
  }

  // Kategorileri güncelle
  updateCategories(): void {
    const uniqueCategories = [...new Set(this.allTasks.map((t) => t.category))];
    this.categories = ['all', ...uniqueCategories];
  }

  // Filtre değiştiğinde çağrılan fonksiyon
  onFilterChange(): void {
    console.log('Filtre değişti:', this.selectedCategory);

    if (this.selectedCategory === 'all') {
      this.filteredTasks = [...this.allTasks];
    } else {
      this.filteredTasks = this.allTasks.filter((task) => task.category === this.selectedCategory);
    }
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

    const today = new Date();
    const dueDate = new Date(task.dueDate);

    today.setHours(0, 0, 0, 0);
    dueDate.setHours(0, 0, 0, 0);

    return dueDate < today;
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
}
