import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskService } from '../../services/task';
import { RouterLink } from '@angular/router';

interface TaskStats {
  total: number;
  done: number;
  pending: number;
  overdue: number;
}

interface CategoryStats {
  category: string;
  completed: number;
  pending: number;
  overdue: number;
  total: number;
}

@Component({
  selector: 'app-stats',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './stats.html',
  styleUrl: './stats.scss',
})
export class Stats implements OnInit {
  public stats: TaskStats = {
    total: 0,
    done: 0,
    pending: 0,
    overdue: 0,
  };

  public categoryStats: CategoryStats[] = [];

  constructor(private taskService: TaskService) {}

  ngOnInit(): void {
    this.loadStats();
    this.loadCategoryStats();
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

  loadCategoryStats(): void {
    this.taskService.getCategoryStats().subscribe({
      next: (stats) => {
        this.categoryStats = stats;
        console.log('Kategori stats yüklendi:', stats);
      },
      error: (error) => {
        console.error('Kategori stats yükleme hatası:', error);
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

  // Kategori için tamamlanma yüzdesi
  getCategoryCompletionPercent(cat: CategoryStats): number {
    if (cat.total === 0) return 0;
    return (cat.completed / cat.total) * 100;
  }
}
