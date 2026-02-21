import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'merge',
    pathMatch: 'full'
  },
  {
    path: 'merge',
    loadComponent: () => import('./features/merger/merger.component').then(m => m.MergerComponent)
  },
  {
    path: 'split',
    loadComponent: () => import('./features/splitter/splitter.component').then(m => m.SplitterComponent)
  },
  {
    path: 'organize',
    loadComponent: () => import('./features/organizer/organizer.component').then(m => m.OrganizerComponent)
  },
  {
    path: 'convert',
    loadComponent: () => import('./features/converter/converter.component').then(m => m.ConverterComponent)
  },
  {
    path: '**',
    redirectTo: 'merge'
  }
];
