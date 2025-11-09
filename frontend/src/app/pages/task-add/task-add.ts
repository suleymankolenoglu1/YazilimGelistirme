import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { TaskService, Task } from '../../services/task';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-task-add',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './task-add.html',
  styleUrl: './task-add.scss'
})
export class TaskAdd implements OnInit { 

  public task: Task = {
    id: 0,
    title: '',
    description: '',
    category: '',
    status: 'pending',
    dueDate: '',
    dueTime: ''
  };

  public isEditMode = false;
  public pageTitle = 'Yeni Görev Ekle'; 

  
  constructor(
    private taskService: TaskService, 
    private router: Router,
    private route: ActivatedRoute 
  ) { }

  ngOnInit(): void {
   
    const idFromUrl = +this.route.snapshot.params['id'];
    
    if (idFromUrl) {
      this.isEditMode = true;
      this.pageTitle = 'Görevi Düzenle';
      
      const existingTask = this.taskService.getTaskById(idFromUrl);

      if (existingTask) {
        
        this.task = { ...existingTask }; // Formu doldur
      } else {
        alert('Görev bulunamadı!');
        this.router.navigate(['/']);
      }
    }
  }

  onSubmit(): void {
    if (this.isEditMode) {
      this.taskService.updateTask(this.task);
      alert('Görev başarıyla güncellendi!');
    }
    else {
      this.taskService.addTask(this.task);
      alert('Yeni görev başarıyla eklendi!');
    }

    // Her iki durumda da iş bitince ana sayfaya yönlendir
    this.router.navigate(['/']); 
  }

}