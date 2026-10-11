/**
 * PDF-Xpress Design System Tokens
 * This file serves as the single source of truth for all design constants.
 */

export const APP_TOKENS = {
  /**
   * SPACING
   * Base unit: 4px
   */
  spacing: {
    none: '0px',
    xs: '4px', // Smallest gaps, tight padding
    sm: '8px', // Standard small gap
    md: '16px', // Standard section padding/gap
    lg: '24px', // Large section spacing
    xl: '32px', // Page-level header spacing
    xxl: '40px', // Content container padding
    xxxl: '48px', // Hero-level spacing
  },

  /**
   * TYPOGRAPHY
   * Font families and comprehensive scale.
   */
  typography: {
    fontFamily: {
      sans: "'Plus Jakarta Sans', sans-serif",
      mono: "'JetBrains Mono', monospace",
    },
    size: {
      displayLarge: '36px', // Page Titles (h1)
      displaySmall: '28px', // Feature Headers
      headlineLarge: '24px', // Modal/Card Headers
      headlineMedium: '20px', // Section Headers
      titleLarge: '18px', // Prominent sub-labels
      titleMedium: '16px', // Standard sub-labels
      bodyLarge: '15px', // Global base text
      bodyMedium: '14px', // Standard UI text (buttons, inputs)
      bodySmall: '13px', // Secondary UI text
      labelLarge: '11px', // Eyebrows, small badges
      labelSmall: '10px', // Metadata, compact badges
      caption: '9px', // Version labels, micro-text
    },
    weight: {
      thin: '100',
      light: '300',
      regular: '400',
      medium: '500',
      semiBold: '600',
      bold: '700',
      extraBold: '800',
    },
    lineHeight: {
      tight: '1.05',
      normal: '1.5',
      relaxed: '1.75',
    },
    letterSpacing: {
      tight: '-0.03em',
      normal: '0',
      wide: '0.1em',
      extraWide: '0.12em',
    },
  },

  /**
   * COLORS
   * Primitive palette followed by the semantic layer.
   */
  colors: {
    // Primitive Palette
    primitives: {
      teal500: '#0D9488',
      teal600: '#0F766E',
      teal50: '#F0FDFA',
      teal100: '#99F6E4',
      slate50: '#F8FAFC',
      slate100: '#F1F5F9',
      slate200: '#E2E8F0',
      slate300: '#CBD5E1',
      slate700: '#334155',
      slate800: '#1E293B',
      slate900: '#0F172A',
      red500: '#EF4444',
      red50: '#FEF2F2',
      green500: '#22C55E',
      green50: '#F0FDF4',
    },
    // Semantic Layer
    semantic: {
      colorPrimary: 'var(--accent)',
      colorSecondary: 'var(--accent-h)',
      colorBackground: 'var(--bg)',
      colorSurface: 'var(--surface)',
      colorSurface2: 'var(--surface-2)',
      colorSurface3: 'var(--surface-3)',
      colorOnPrimary: '#FFFFFF',
      colorOnBackground: 'var(--text)',
      colorTextPrimary: 'var(--text)',
      colorTextSecondary: 'var(--text-2)',
      colorTextTertiary: 'var(--text-3)',
      colorTextDisabled: 'var(--text-4)',
      colorBorder: 'var(--border)',
      colorBorderStrong: 'var(--border-2)',
      colorDivider: 'var(--border)',
      colorError: 'var(--red)',
      colorErrorSubtle: 'var(--red-subtle)',
      colorSuccess: 'var(--green)',
      colorSuccessSubtle: 'var(--green-subtle)',
      colorInfo: 'var(--accent)',
      colorWarning: '#F59E0B',
    },
  },

  /**
   * BORDER RADIUS
   */
  radius: {
    none: '0px',
    xs: '4px',
    sm: '6px',
    md: '10px',
    lg: '14px',
    xl: '20px',
    xxl: '24px',
    full: '9999px',
  },

  /**
   * SHADOWS / ELEVATION
   */
  shadows: {
    elevation0: 'none',
    elevation1: 'var(--shadow-sm)',
    elevation2: 'var(--shadow-md)',
    elevation3: 'var(--shadow-lg)',
    elevation4: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    elevation5: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    accentHover: '0 6px 20px rgba(13, 148, 136, 0.3)',
  },

  /**
   * ANIMATION
   */
  animation: {
    durationFast: '100ms',
    durationNormal: '200ms',
    durationSlow: '400ms',
    easingStandard: 'cubic-bezier(0.4, 0, 0.2, 1)',
    easingDecelerate: 'cubic-bezier(0.0, 0.0, 0.2, 1)',
    easingAccelerate: 'cubic-bezier(0.4, 0.0, 1, 1)',
  },

  /**
   * BREAKPOINTS
   */
  breakpoints: {
    mobile: '0px',
    tablet: '768px',
    desktop: '1280px',
  },

  /**
   * TOUCH TARGETS (WCAG)
   */
  touch: {
    minTarget: '44px',
  },
} as const;
