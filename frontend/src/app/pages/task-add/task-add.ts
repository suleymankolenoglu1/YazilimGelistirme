import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { TaskService, Attachment } from '../../services/task';

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
  selectedFile: File | null = null;
  attachments: Attachment[] = [];

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
      this.loadAttachments(this.taskId);
    }
  }

  // Dosya seçildiğinde
  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      console.log('Dosya seçildi:', this.selectedFile.name);
    }
  }

  // Mevcut dosyaları yükle (edit modda)
  loadAttachments(taskId: number): void {
    this.taskService.getAttachments(taskId).subscribe({
      next: (attachments) => {
        this.attachments = attachments;
        console.log('Attachments yüklendi:', attachments);
      },
      error: (error) => {
        console.error('Attachment yükleme hatası:', error);
      },
    });
  }

  // Dosya indirme URL'i
  getDownloadUrl(attachmentId: number): string {
    return this.taskService.getDownloadUrl(attachmentId);
  }

  // Dosya indir (token ile)
  onDownloadAttachment(attachment: Attachment): void {
    this.taskService.downloadFile(attachment.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = attachment.originalFileName;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (error) => {
        console.error('Dosya indirme hatası:', error);
        alert('Dosya indirilemedi!');
      },
    });
  }

  // Dosya sil
  onDeleteAttachment(attachmentId: number): void {
    if (confirm('Bu dosyayı silmek istediğinize emin misiniz?')) {
      this.taskService.deleteAttachment(attachmentId).subscribe({
        next: () => {
          this.attachments = this.attachments.filter(a => a.id !== attachmentId);
          console.log('Dosya silindi');
        },
        error: (error) => {
          console.error('Dosya silme hatası:', error);
          alert('Dosya silinemedi!');
        },
      });
    }
  }

  loadTask(id: number): void {
    this.taskService.getTasks().subscribe({
      next: (tasks) => {
        const foundTask = tasks.find((t) => t.id === id);

        if (foundTask) {
          // Tarihi YYYY-MM-DD formatına çevir (input type="date" için)
          // NOT: toISOString() UTC'ye çevirir ve gün kayar, bu yüzden local format kullanıyoruz
          let formattedDate = '';
          if (foundTask.dueDate) {
            const date = new Date(foundTask.dueDate);
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            formattedDate = `${year}-${month}-${day}`;
          }
          
          // Saati HH:mm formatına çevir (saniyesiz)
          let formattedTime = foundTask.dueTime || '';
          if (formattedTime && formattedTime.length > 5) {
            formattedTime = formattedTime.substring(0, 5);
          }
          
          this.task = {
            title: foundTask.title,
            description: foundTask.description || '',
            category: foundTask.category,
            dueDate: formattedDate,
            dueTime: formattedTime,
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
          
          // Yeni dosya seçildiyse yükle
          if (this.selectedFile && this.taskId) {
            this.uploadFileAfterTask(this.taskId);
          } else {
            alert('Görev başarıyla güncellendi!');
            this.router.navigate(['/task-list']);
          }
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
          
          // Dosya varsa yükle
          if (this.selectedFile && response.id) {
            this.uploadFileAfterTask(response.id);
          } else {
            alert('Görev başarıyla eklendi!');
            this.router.navigate(['/task-list']);
          }
        },
        error: (error) => {
          console.error('Task ekleme hatası:', error);
          const errorMessage = error.error?.message || error.error || 'Görev eklenemedi!';
          alert(errorMessage);
        },
      });
    }
  }

  // Görev eklendikten sonra dosya yükle
  private uploadFileAfterTask(taskId: number): void {
    if (!this.selectedFile) return;
    
    this.taskService.uploadFile(taskId, this.selectedFile).subscribe({
      next: () => {
        console.log('Dosya yüklendi');
        alert('Görev ve dosya başarıyla eklendi!');
        this.router.navigate(['/task-list']);
      },
      error: (error) => {
        console.error('Dosya yükleme hatası:', error);
        alert('Görev eklendi ama dosya yüklenemedi: ' + (error.error?.message || error.error || 'Hata'));
        this.router.navigate(['/task-list']);
      },
    });
  }
}
