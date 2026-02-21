import { Component, signal, HostListener } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  host: { style: 'display: block; width: 100%; height: 100%;' },
  styles: [`
    .layout {
      display: grid;
      height: 100vh;
      overflow: hidden;
      transition: grid-template-columns .28s cubic-bezier(.22,1,.36,1);
    }
    aside {
      background: var(--sidebar-bg);
      border-right: 1px solid var(--sidebar-border);
      display: flex; flex-direction: column;
      height: 100vh; overflow: hidden;
      position: relative;
    }
    main {
      height: 100vh;
      overflow-y: auto;
      background: var(--bg);
    }
    .content-wrap {
      width: 100%; max-width: 800px;
      margin: 0 auto;
      padding: 48px 40px;
    }
    .logo-box {
      width:36px; height:36px; border-radius:10px;
      background: var(--accent);
      display:flex; align-items:center; justify-content:center;
      color:#fff; flex-shrink:0;
    }
    .logo-row {
      display:flex; align-items:center; gap:12px;
      padding:14px 14px; height:64px;
      border-bottom:1px solid var(--sidebar-border);
      flex-shrink:0;
    }
    .section-lbl {
      font-family: var(--mono); font-size:10px; font-weight:500;
      letter-spacing:.1em; text-transform:uppercase;
      color:var(--text-3); padding:14px 14px 6px;
    }
    nav { flex:1; padding:4px 8px; overflow-y:auto; display:flex; flex-direction:column; gap:2px; }
    .ni {
      position:relative; display:flex; align-items:center; gap:10px;
      padding:10px 12px; border-radius:10px; width:100%;
      font-size:14px; font-weight:600; color:var(--text-2);
      text-decoration:none; cursor:pointer;
      transition:background .15s, color .15s;
    }
    .ni:hover { background:var(--surface-2); color:var(--text); }
    .ni.active { background:var(--accent-subtle); color:var(--accent); }
    .ni.active::before {
      content:''; position:absolute; left:0; top:50%; transform:translateY(-50%);
      width:3px; height:22px; background:var(--accent); border-radius:0 3px 3px 0;
    }
    .ni svg { flex-shrink:0; }
    .ni-label { white-space:nowrap; }
    .sidebar-footer {
      padding:8px; border-top:1px solid var(--sidebar-border); flex-shrink:0;
    }
    .theme-btn {
      display:flex; align-items:center; gap:10px; width:100%;
      padding:10px 12px; border-radius:10px;
      font-size:14px; font-weight:600; color:var(--text-3);
      transition:background .15s, color .15s; cursor:pointer;
    }
    .theme-btn:hover { background:var(--surface-2); color:var(--text-2); }
    .collapse-btn {
      position:absolute; right:-13px; top:72px;
      width:26px; height:26px; border-radius:50%;
      background:var(--surface); border:1px solid var(--border);
      display:flex; align-items:center; justify-content:center;
      color:var(--text-3); font-size:14px; cursor:pointer;
      box-shadow:var(--shadow-sm);
      transition:border-color .15s, color .15s; z-index:10;
    }
    .collapse-btn:hover { border-color:var(--accent); color:var(--accent); }
    .mobile-bar {
      display:none; height:56px; padding:0 16px;
      align-items:center; gap:12px;
      border-bottom:1px solid var(--border);
      background:var(--surface); flex-shrink:0;
    }
    .overlay {
      position:fixed; inset:0; z-index:40; background:rgba(0,0,0,.55);
    }
    @media(max-width:768px) {
      .layout { display: block; }
      aside {
        position:fixed; left:0; top:0; bottom:0; width:260px;
        transform:translateX(-100%); transition:transform .28s var(--ease);
        z-index:50; box-shadow:none;
      }
      aside.open { transform:none; box-shadow:var(--shadow-lg); }
      .mobile-bar { display:flex; }
      .collapse-btn { display:none; }
      .content-wrap { padding:16px 20px; }
    }
  `],
  template: `
    @if (menuOpen()) {
      <div class="overlay" (click)="menuOpen.set(false)"></div>
    }

    <div class="layout" [style.gridTemplateColumns]="collapsed() ? '68px 1fr' : '240px 1fr'">

      <!-- SIDEBAR -->
      <aside [class.open]="menuOpen()">

        <div class="logo-row">
          <div class="logo-box">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16c0 1.1.9 2 2 2h12a2 2 0 0 0 2-2V8z"/>
              <path d="M14 2v6h6"/>
            </svg>
          </div>
          @if (!collapsed()) {
            <div style="min-width:0;" class="animate-fade-in">
              <div style="font-size:15px;font-weight:800;color:var(--text);white-space:nowrap;letter-spacing:-.02em;">PDF-Xpress</div>
              <div style="font-family:var(--mono);font-size:9px;color:var(--text-3);letter-spacing:.12em;text-transform:uppercase;">Pro Edition</div>
            </div>
          }
          <button class="collapse-btn" (click)="collapsed.set(!collapsed())">
            {{ collapsed() ? '›' : '‹' }}
          </button>
        </div>

        @if (!collapsed()) {
          <div class="section-lbl animate-fade-in">Araçlar</div>
        }

        <nav>
          <!-- Birleştir -->
          <a routerLink="/merge" routerLinkActive #r1="routerLinkActive"
             class="ni" [class.active]="r1.isActive" (click)="menuOpen.set(false)"
             [title]="collapsed() ? 'Birleştir' : ''">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/>
              <line x1="8" y1="18" x2="21" y2="18"/>
              <circle cx="3" cy="6" r="1" fill="currentColor" stroke="none"/>
              <circle cx="3" cy="12" r="1" fill="currentColor" stroke="none"/>
              <circle cx="3" cy="18" r="1" fill="currentColor" stroke="none"/>
            </svg>
            @if (!collapsed()) { <span class="ni-label">Birleştir</span> }
          </a>

          <!-- Böl -->
          <a routerLink="/split" routerLinkActive #r2="routerLinkActive"
             class="ni" [class.active]="r2.isActive" (click)="menuOpen.set(false)"
             [title]="collapsed() ? 'Böl' : ''">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <rect x="4" y="2" width="16" height="20" rx="2"/>
              <line x1="12" y1="14" x2="12" y2="8"/>
              <polyline points="9,11 12,14 15,11"/>
            </svg>
            @if (!collapsed()) { <span class="ni-label">Böl</span> }
          </a>

          <!-- Düzenle -->
          <a routerLink="/organize" routerLinkActive #r3="routerLinkActive"
             class="ni" [class.active]="r3.isActive" (click)="menuOpen.set(false)"
             [title]="collapsed() ? 'Düzenle' : ''">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <rect x="3" y="3" width="7" height="7" rx="1.5"/>
              <rect x="14" y="3" width="7" height="7" rx="1.5"/>
              <rect x="14" y="14" width="7" height="7" rx="1.5"/>
              <rect x="3" y="14" width="7" height="7" rx="1.5"/>
            </svg>
            @if (!collapsed()) { <span class="ni-label">Düzenle</span> }
          </a>

          <!-- Dönüştür -->
          <a routerLink="/convert" routerLinkActive #r4="routerLinkActive"
             class="ni" [class.active]="r4.isActive" (click)="menuOpen.set(false)"
             [title]="collapsed() ? 'Dönüştür' : ''">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <polyline points="1,4 1,10 7,10"/>
              <polyline points="23,20 23,14 17,14"/>
              <path d="M20.49,9A9,9,0,0,0,5.64,5.64L1,10m22,4-4.64,4.36A9,9,0,0,1,3.51,15"/>
            </svg>
            @if (!collapsed()) { <span class="ni-label">Dönüştür</span> }
          </a>
        </nav>

        <div class="sidebar-footer">
          <button class="theme-btn" (click)="toggleTheme()">
            @if (dark()) {
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/>
                <line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/>
                <line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
              </svg>
            } @else {
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            }
            @if (!collapsed()) { <span>{{ dark() ? 'Açık Tema' : 'Koyu Tema' }}</span> }
          </button>
        </div>
      </aside>

      <!-- MAIN -->
      <div style="display:flex;flex-direction:column;height:100vh;overflow:hidden;">
        <div class="mobile-bar">
          <button (click)="menuOpen.set(!menuOpen())" style="padding:6px;border-radius:8px;color:var(--text-2);">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
          <span style="font-weight:800;">PDF-Xpress</span>
        </div>
        <main>
          <div class="content-wrap">
            <router-outlet></router-outlet>
          </div>
        </main>
      </div>
    </div>
  `
})
export class ShellComponent {
  collapsed = signal(false);
  menuOpen = signal(false);
  dark = signal(this.initTheme());

  private initTheme(): boolean {
    const s = localStorage.getItem('theme');
    const sys = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const d = s === 'dark' || (!s && sys);
    document.documentElement.setAttribute('data-theme', d ? 'dark' : 'light');
    return d;
  }

  @HostListener('window:resize')
  onResize() { if (window.innerWidth > 768) this.menuOpen.set(false); }

  toggleTheme() {
    const d = !this.dark();
    this.dark.set(d);
    document.documentElement.setAttribute('data-theme', d ? 'dark' : 'light');
    localStorage.setItem('theme', d ? 'dark' : 'light');
  }
}
