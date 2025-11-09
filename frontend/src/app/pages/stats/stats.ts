import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // *ngIf, *ngFor için
import { TaskService } from '../../services/task'; 

interface TaskStats {
  total: number;
  done: number;
  pending: number;
  overdue: number;
}

@Component({
  selector: 'app-stats',
  standalone: true,
  imports: [CommonModule], 
  templateUrl: './stats.html',
  styleUrl: './stats.scss'
})
export class Stats implements OnInit { 
  public stats: TaskStats = {
    total: 0,
    done: 0,
    pending: 0,
    overdue: 0
  };
  //entegre edilenler
  constructor(private taskService: TaskService) { }
  ngOnInit(): void 
  {
    this.stats = this.taskService.getStats();
  }
  //yüzde hesaplama fonksiyonu
  getPercentage(count: number): number {
    if (this.stats.total === 0) {
      return 0; 
    }
    return (count / this.stats.total) * 100;
  }
}