# AGENTS.md - PDF-Xpress Development Guide

## Project Overview

PDF-Xpress is a web-based PDF utility application built with Angular 21. It provides PDF merge, split, organize, and convert features with 100% client-side processing using pdf-lib and PDF.js.

## Build Commands

```bash
# Development
npm run dev              # Start Angular dev server (port 4200)
npm start                # Alias for dev

# Build
npm run build            # Production build to dist/
npm run watch            # Watch mode for development

# Testing
npm test                 # Run tests (Vitest/Angular Testing)
npx ng test              # Single test run
npx ng test --watch      # Watch mode for tests
npx ng test --browsers=ChromeHeadless --code-coverage  # Single run with coverage

# Code Quality
npx ng lint              # Run Angular linter
npx prettier --write src/app/  # Format code
npx tsc --noEmit         # Type check
```

## Code Style Guidelines

### TypeScript Strict Mode

This project enforces strict TypeScript:
- `strict: true` - All strict type-checking options
- `noImplicitOverride: true` - Must use `override` keyword
- `noPropertyAccessFromIndexSignature: true` - Use bracket notation for dynamic properties
- `noImplicitReturns: true` - All code paths must return a value
- `noFallthroughCasesInSwitch: true` - Must have break in all switch cases

### Angular 21 Modern APIs (Required)

```typescript
// ✅ Standalone components
@Component({ standalone: true, imports: [CommonModule], ... })

// ❌ DON'T use NgModules
@Component({ declarations: [...] })

// ✅ Signal-based state
const count = signal(0);
const doubled = computed(() => count() * 2);

// ✅ input() / output() functions
count = input(0);
change = output<void>();

// ✅ Control flow syntax
@if (condition) { ... }
@for (item of items; track item.id) { ... }

// ✅ inject() function
private service = inject(MyService);
```

### Imports Order

1. Angular core (@angular/core)
2. Angular router/common/forms
3. Third-party libraries
4. Shared components/pipes
5. Core services/models
6. Feature components

```typescript
import { Component, signal, inject } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';
import { DropZoneComponent } from '@shared/components/drop-zone/drop-zone.component';
import { PdfLibService } from '@core/services/pdf-lib.service';
import { PdfFile } from '@core/models/pdf-file.model';
import { MergerStore } from './merger.store';
```

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Components | kebab-case | `merger.component.ts` |
| Classes | PascalCase | `MergerComponent` |
| Services | PascalCase + Service | `PdfLibService` |
| Signals/Variables | camelCase | `isLoading` |
| Constants | SCREAMING_SNAKE | `MAX_FILE_SIZE` |
| Interfaces | PascalCase | `PdfFile` |
| CSS Classes | kebab-case | `.drop-zone` |

### File Structure

```
src/app/
├── core/
│   ├── services/     # Business logic services
│   └── models/       # TypeScript interfaces
├── shared/
│   ├── components/   # Reusable UI components
│   └── pipes/        # Angular pipes
├── features/
│   ├── merger/       # Feature: merge PDFs
│   ├── splitter/     # Feature: split PDF
│   ├── organizer/   # Feature: organize pages
│   └── converter/   # Feature: PDF ↔ Image
└── layout/
    └── shell.component.ts
```

### Error Handling

```typescript
// ✅ Try-catch with typed errors
try {
  const result = await service.process();
} catch (error: unknown) {
  const message = error instanceof Error ? error.message : 'Unknown error';
  patchState(store, { error: message });
}

// ❌ DON'T use empty catch blocks
catch { }

// ✅ User-friendly error messages (Turkish)
error: 'PDF dosyası yüklenemedi'
```

### CSS & Styling

- Use **CSS custom properties** from `tokens.css`
- Use **Tailwind CSS** utility classes when appropriate
- Avoid inline styles

### State Management (@ngrx/signals)

```typescript
export const MergerStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed((store) => ({ totalPages: computed(() => ...) })),
  withMethods((store) => ({ addFile: (file: File) => { ... } }))
);

// Usage in components
const store = inject(MergerStore);
store.addFile(file);
```

### Testing

- Use Vitest/Angular Testing for unit tests
- Test signal stores by testing methods and computed values
- Tests are skipped by default when generating components (`skipTests: true` in angular.json)

### Key Dependencies

| Package | Purpose |
|---------|---------|
| `@angular/core` ^21.x | UI Framework |
| `@ngrx/signals` | State Management |
| `pdf-lib` | PDF manipulation |
| `pdfjs-dist` | PDF rendering |
| `@angular/cdk` | Drag & Drop |

### Quick Reference

- `npm run dev` - Start dev server
- `npm run build` - Production build
- `npx ng g c features/merger` - Generate component
- `npx ng g s core/services/pdf-lib` - Generate service
