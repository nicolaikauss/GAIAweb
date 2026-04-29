/**
 * Design System Tokens
 * 
 * Single source of truth for all design tokens in the application.
 * Based on the Main Dashboard as the reference implementation.
 * 
 * CRITICAL: All colors, spacing, typography, and other design values
 * should be referenced from this file. Never use hardcoded values in components.
 */

export const tokens = {
  // Color palette - using semantic tokens from index.css
  colors: {
    // Core semantic colors
    background: 'hsl(var(--background))',
    foreground: 'hsl(var(--foreground))',
    
    // UI elements
    card: 'hsl(var(--card))',
    cardForeground: 'hsl(var(--card-foreground))',
    
    popover: 'hsl(var(--popover))',
    popoverForeground: 'hsl(var(--popover-foreground))',
    
    primary: 'hsl(var(--primary))',
    primaryForeground: 'hsl(var(--primary-foreground))',
    
    secondary: 'hsl(var(--secondary))',
    secondaryForeground: 'hsl(var(--secondary-foreground))',
    
    muted: 'hsl(var(--muted))',
    mutedForeground: 'hsl(var(--muted-foreground))',
    
    accent: 'hsl(var(--accent))',
    accentForeground: 'hsl(var(--accent-foreground))',
    
    destructive: 'hsl(var(--destructive))',
    destructiveForeground: 'hsl(var(--destructive-foreground))',
    
    border: 'hsl(var(--border))',
    input: 'hsl(var(--input))',
    ring: 'hsl(var(--ring))',
    
    // Glass morphism effects (from Dashboard)
    glassBackground: 'bg-white/10',
    glassBorder: 'border-white/20',
    glassHover: 'hover:bg-white/20',
    glassBackdrop: 'backdrop-blur-md',
  },
  
  // Typography scale (from Dashboard)
  typography: {
    // Font families
    fontFamily: {
      sans: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    },
    
    // Font sizes
    fontSize: {
      xs: '0.75rem',    // 12px
      sm: '0.875rem',   // 14px
      base: '1rem',     // 16px
      lg: '1.125rem',   // 18px
      xl: '1.25rem',    // 20px
      '2xl': '1.5rem',  // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem', // 36px
      '5xl': '3rem',    // 48px
      '7xl': '4.5rem',  // 72px
      '9xl': '8rem',    // 128px
    },
    
    // Font weights
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
    
    // Line heights
    lineHeight: {
      tight: '1.25',
      normal: '1.5',
      relaxed: '1.75',
    },
  },
  
  // Spacing scale (from Dashboard)
  spacing: {
    px: '1px',
    0: '0',
    0.5: '0.125rem', // 2px
    1: '0.25rem',    // 4px
    1.5: '0.375rem', // 6px
    2: '0.5rem',     // 8px
    2.5: '0.625rem', // 10px
    3: '0.75rem',    // 12px
    3.5: '0.875rem', // 14px
    4: '1rem',       // 16px
    5: '1.25rem',    // 20px
    6: '1.5rem',     // 24px
    7: '1.75rem',    // 28px
    8: '2rem',       // 32px
    10: '2.5rem',    // 40px
    12: '3rem',      // 48px
    16: '4rem',      // 64px
    20: '5rem',      // 80px
    24: '6rem',      // 96px
  },
  
  // Border radius (from Dashboard)
  borderRadius: {
    none: '0',
    sm: 'calc(var(--radius) - 4px)',
    md: 'calc(var(--radius) - 2px)',
    lg: 'var(--radius)',          // 0.75rem / 12px
    xl: '1rem',                   // 16px
    '2xl': '1.5rem',             // 24px
    full: '9999px',
  },
  
  // Shadows (from Dashboard glass morphism)
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    base: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  },
  
  // Z-index scale
  zIndex: {
    0: 0,
    10: 10,
    20: 20,
    30: 30,
    40: 40,
    50: 50,
    auto: 'auto',
  },
  
  // Motion (from Dashboard)
  motion: {
    duration: {
      fast: '0.2s',
      base: '0.3s',
      slow: '0.5s',
      slower: '0.8s',
    },
    easing: {
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
  },
  
  // Breakpoints
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
  
  // Container widths (from Dashboard)
  containers: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1400px',
    '6xl': '72rem', // 1152px (Dashboard max-w-6xl)
    '7xl': '80rem', // 1280px
  },
} as const;

/**
 * Tailwind class presets for common Dashboard patterns
 */
export const classPresets = {
  // Page layouts
  page: {
    container: 'relative z-10 w-full max-w-6xl px-4 sm:px-6 py-6 sm:py-8 mx-auto',
    header: 'mb-6 sm:mb-8 flex items-center justify-between',
    title: 'text-2xl sm:text-3xl font-bold',
    subtitle: 'text-base sm:text-lg md:text-xl text-muted-foreground',
  },
  
  // Glass morphism (Dashboard style)
  glass: {
    card: 'border-white/20 bg-white/10 backdrop-blur-md rounded-2xl shadow-lg',
    button: 'rounded-full border-white/20 bg-white/10 backdrop-blur-md hover:bg-white/20',
    input: 'bg-white/80 backdrop-blur-md border-white/40 rounded-full shadow-lg',
    badge: 'bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-white/40',
  },
  
  // Card variants
  card: {
    default: 'bg-card border border-border rounded-2xl p-6',
    glass: 'border-white/20 bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-lg',
    hover: 'transition-all hover:scale-105 active:scale-95',
  },
  
  // Button variants (consistent with Dashboard)
  button: {
    primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
    outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
    glass: 'rounded-full border-white/20 bg-white/10 backdrop-blur-md hover:bg-white/20',
  },
  
  // Text styles
  text: {
    title: 'text-foreground font-bold',
    subtitle: 'text-muted-foreground',
    body: 'text-foreground',
    caption: 'text-xs text-muted-foreground',
  },
  
  // Animations (from Dashboard)
  animation: {
    fadeIn: 'initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}',
    fadeInUp: 'initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}',
    scaleIn: 'initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}',
  },
} as const;

/**
 * Component size variants
 */
export const sizeVariants = {
  button: {
    sm: 'h-9 px-3 text-sm',
    md: 'h-10 px-4 text-base',
    lg: 'h-11 px-6 text-lg',
    icon: 'h-10 w-10',
  },
  input: {
    sm: 'h-8 text-sm',
    md: 'h-10 text-base',
    lg: 'h-12 text-base',
  },
  card: {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  },
} as const;

export default tokens;
