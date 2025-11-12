import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { TaskService } from '../../services/task';

@Component({
  selector: 'app-task-add',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './task-add.html',
  styleUrl: './task-add.scss',
})
export class TaskAdd implements OnInit {
  isEditMode = false;
  taskId: number | null = null;

  task = {
    title: '',
    description: '',
    category: '',
    dueDate: '',
    dueTime: '',
    status: 'todo',
  };

  constructor(
    private taskService: TaskService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Route parametresinden ID'yi al
    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      // Edit mode
      this.isEditMode = true;
      this.taskId = parseInt(id);
      this.loadTask(this.taskId);
    }
  }

  loadTask(id: number): void {
    this.taskService.getTasks().subscribe({
      next: (tasks) => {
        const foundTask = tasks.find((t) => t.id === id);

        if (foundTask) {
          this.task = {
            title: foundTask.title,
            description: foundTask.description || '',
            category: foundTask.category,
            dueDate: foundTask.dueDate,
            dueTime: foundTask.dueTime,
            status: foundTask.status,
          };
          console.log('Task yüklendi:', this.task);
        } else {
          alert('Görev bulunamadı!');
          this.router.navigate(['/task-list']);
        }
      },
      error: (error) => {
        console.error('Task yükleme hatası:', error);
        alert('Görev yüklenemedi!');
        this.router.navigate(['/task-list']);
      },
    });
  }

  onSubmit(): void {
    console.log('Task formu gönderildi:', this.task);

    if (this.isEditMode && this.taskId) {
      // GÜNCELLEME
      this.taskService.updateTask(this.taskId, this.task).subscribe({
        next: (response) => {
          console.log('Task güncellendi:', response);
          alert('Görev başarıyla güncellendi!');
          this.router.navigate(['/task-list']);
        },
        error: (error) => {
          console.error('Task güncelleme hatası:', error);
          const errorMessage = error.error?.message || error.error || 'Görev güncellenemedi!';
          alert(errorMessage);
        },
      });
    } else {
      // EKLEME
      this.taskService.addTask(this.task).subscribe({
        next: (response) => {
          console.log('Task eklendi:', response);
          alert('Görev başarıyla eklendi!');
          this.router.navigate(['/task-list']);
        },
        error: (error) => {
          console.error('Task ekleme hatası:', error);
          const errorMessage = error.error?.message || error.error || 'Görev eklenemedi!';
          alert(errorMessage);
        },
      });
    }
  }
}
