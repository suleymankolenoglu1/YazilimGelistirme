import { Routes } from '@angular/router';
import { TaskListComponent } from './pages/task-list/task-list';
import { TaskAdd } from './pages/task-add/task-add';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register'; 
import { authGuard } from './services/auth-guard';
import { Stats } from './pages/stats/stats'; 
import { AdminPanelComponent } from './pages/admin-panel/admin-panel';


export const routes: Routes = [
  { path: '', component: TaskListComponent, canActivate :[authGuard]}, // Ana sayfa
  { path: 'add', component: TaskAdd, canActivate :[authGuard]}, // Görev Ekle
  { path: 'edit/:id', component: TaskAdd, canActivate :[authGuard] }, // Görev Düzenle
  { path: 'stats', component: Stats, canActivate :[authGuard] }, // İstatistikler

  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'admin', component: AdminPanelComponent }
  

  
];