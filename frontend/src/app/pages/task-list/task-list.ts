import { Component, OnInit } from '@angular/core'; 
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router'; // routerLink için
import { FormsModule } from '@angular/forms'; // 1. YENİ İMPORT: [(ngModel)] için

import { TaskService, Task } from '../../services/task';

@Component({
  selector: 'app-task-list',
  standalone: true, 
  imports: [CommonModule, RouterLink, FormsModule], 
  templateUrl: './task-list.html',
  styleUrl: './task-list.scss'
})
export class TaskListComponent implements OnInit { 
  private allTasks: Task[] = []; 
  public filteredTasks: Task[] = []; 
  public selectedCategory: string = 'all'; 
  public categories: string[] = ['all'];

  constructor(private taskService: TaskService) { }

  ngOnInit(): void {
    this.allTasks = this.taskService.getTasks();
    this.filteredTasks = [...this.allTasks]; // Kopya al

    console.log("TaskListComponent: Tüm görevler ve filtreli görevler yüklendi.");

    const dynamicCategories = this.taskService.getCategories();
    this.categories.push(...dynamicCategories);
 }
 
  // Filtre değiştiğinde çağrılan fonksiyon
  onFilterChange(): void {
    console.log('Filtre değişti:', this.selectedCategory);
    
    if (this.selectedCategory === 'all') {
      this.filteredTasks = [...this.allTasks];// Tümü seçildiyse, tüm görevleri göster ve kopyala
    } 
    else {
      this.filteredTasks = this.allTasks.filter(
        task => task.category === this.selectedCategory
      );
    }
  }

  // Görev silme fonksiyonu
  onDelete(idToDelete: number): void {
    if (confirm('Bu görevi silmek istediğine emin misin?')) { 
      this.taskService.deleteTask(idToDelete);
      this.allTasks = this.taskService.getTasks();
      // KATEGORİLERİ YENİDEN YÜKLE
      this.categories = ['all']; // Önce sıfırla
      const dynamicCategories = this.taskService.getCategories();
      this.categories.push(...dynamicCategories);
      // Filtreyi yeniden uygula
      this.onFilterChange();
    }
  }

  //yaklaşan tarihli mi? (overdue)
  isOverdue(task: Task): boolean {
    if (task.status === 'done' || !task.dueDate) return false; 

    const today = new Date();
    const dueDate = new Date(task.dueDate);
    
    // Saat farkını sıfırla (Sadece günlere bak)
    today.setHours(0, 0, 0, 0);
    dueDate.setHours(0, 0, 0, 0);

    return dueDate < today;
  }

  isDueSoon(task: Task): boolean {
    if (task.status === 'done' || !task.dueDate) return false; 

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
    if (task.status === 'done') {
      task.status = 'pending'; 
    } 
    else {
      task.status = 'done';
    }
    // GÜNCELLE
    this.taskService.updateTask(task);
    this.allTasks = this.taskService.getTasks();
    this.onFilterChange(); 
  }
}