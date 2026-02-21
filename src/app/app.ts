import { Component } from '@angular/core';
import { ShellComponent } from './layout/shell.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ShellComponent],
  host: { style: 'display: block; height: 100%; width: 100%;' },
  template: '<app-shell></app-shell>'
})
export class App { }
