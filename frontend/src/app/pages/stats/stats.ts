import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskService } from '../../services/task';

interface TaskStats {
  total: number;
  done: number;
  pending: number;
  inProgress: number;
}

@Component({
  selector: 'app-stats',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stats.html',
  styleUrl: './stats.scss',
})
export class Stats implements OnInit {
  public stats: TaskStats = {
    total: 0,
    done: 0,
    pending: 0,
    inProgress: 0,
  };

  constructor(private taskService: TaskService) {}

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    this.taskService.getStats().subscribe({
      next: (stats) => {
        this.stats = stats;
        console.log('Stats yüklendi:', stats);
      },
      error: (error) => {
        console.error('Stats yükleme hatası:', error);
        alert('İstatistikler yüklenemedi!');
      },
    });
  }

  // Yüzde hesaplama fonksiyonu
  getPercentage(count: number): number {
    if (this.stats.total === 0) {
      return 0;
    }
    return (count / this.stats.total) * 100;
  }
}
