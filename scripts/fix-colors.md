# Color Migration Guide

## Find & Replace Patterns

Use these exact find-replace patterns to migrate from hardcoded colors to semantic tokens.

### Text Colors

| Find | Replace | Context |
|------|---------|---------|
| `text-black` | `text-foreground` | Main text |
| `text-white` | `text-primary-foreground` or `text-background` | White text (depends on background) |
| `text-gray-600` | `text-muted-foreground` | Secondary text |
| `text-gray-400` | `text-muted-foreground/70` | Tertiary text |
| `text-gray-500` | `text-muted-foreground` | Secondary text |
| `text-slate-800` | `text-foreground` | Main text |
| `text-slate-700` | `text-foreground` | Main text |
| `text-slate-600` | `text-muted-foreground` | Secondary text |
| `text-slate-500` | `text-muted-foreground` | Secondary text |
| `text-slate-400` | `text-muted-foreground/70` | Tertiary text |
| `text-blue-600` | `text-primary` or `text-accent` | Links/accents |
| `text-blue-700` | `text-primary` | Links/accents |

### Background Colors

| Find | Replace | Context |
|------|---------|---------|
| `bg-white` | `bg-background` | Main background |
| `bg-black` | `bg-foreground` | Dark background |
| `bg-gray-50` | `bg-muted/50` | Light background |
| `bg-gray-100` | `bg-muted` | Light background |
| `bg-gray-800` | `bg-card` | Dark background |
| `bg-slate-50` | `bg-muted/50` | Light background |
| `bg-blue-100` | `bg-primary/10` | Light accent background |
| `bg-blue-50` | `bg-primary/5` | Very light accent background |
| `bg-blue-500` | `bg-primary` | Primary background |
| `bg-blue-500/10` | `bg-primary/10` | Light primary background |

### Border Colors

| Find | Replace | Context |
|------|---------|---------|
| `border-gray-300` | `border-border` | Default border |
| `border-gray-200` | `border-border` | Default border |
| `border-gray-100` | `border-border/50` | Light border |
| `border-slate-200` | `border-border` | Default border |
| `border-slate-100` | `border-border/50` | Light border |
| `border-blue-200` | `border-primary/20` | Primary border |

### Glass Morphism (Dashboard Style)

For glass morphism effects, use these combinations:

```tsx
// Button
className="rounded-full border-white/20 bg-white/10 backdrop-blur-md hover:bg-white/20"

// Card
className="border-white/20 bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-lg"

// Input
className="bg-white/80 backdrop-blur-md border-white/40 rounded-full shadow-lg"

// Badge/Chip
className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-white/40"
```

### Special Cases

#### Dark Mode

Remove explicit dark mode classes - semantic tokens handle this automatically:

```tsx
// ❌ BEFORE
className="text-black dark:text-white"
className="bg-white dark:bg-black"

// ✅ AFTER
className="text-foreground"
className="bg-background"
```

#### Hover States

```tsx
// ❌ BEFORE
hover:bg-gray-50
hover:text-blue-700

// ✅ AFTER
hover:bg-muted/50
hover:text-primary
```

#### Conditional Styling

```tsx
// ❌ BEFORE
className={`${isActive ? 'bg-blue-500 text-white' : 'bg-white text-black'}`}

// ✅ AFTER
className={`${isActive ? 'bg-primary text-primary-foreground' : 'bg-background text-foreground'}`}
```

## Complete Example: Before & After

### Before (AddArtwork.tsx fragment)
```tsx
<Label htmlFor="title" className="text-slate-700 text-xs">Title *</Label>
<Input
  id="title"
  className="bg-white border-slate-200 text-slate-800 h-8 text-sm"
/>
```

### After
```tsx
<Label htmlFor="title" className="text-foreground text-xs">Title *</Label>
<Input
  id="title"
  className="bg-background border-border text-foreground h-8 text-sm"
/>
```

## VSCode Search & Replace

Use VSCode's search and replace (Cmd/Ctrl + Shift + H) with regex enabled:

1. Search: `text-slate-\d+`
   - Replace based on weight (700-800 = foreground, 400-600 = muted-foreground)

2. Search: `bg-gray-\d+`
   - Replace based on weight (50-200 = muted, 800-900 = card)

3. Search: `border-gray-\d+`
   - Replace: `border-border`

## Automated Script

Run this to see all violations:
```bash
chmod +x scripts/audit-colors.sh
./scripts/audit-colors.sh
```

## Priority Order

1. ✅ **Landing/Index pages** - Most visible to new users
2. ✅ **Success/Cancel pages** - Payment flow
3. 🔄 **Dashboard cards and badges** - High traffic
4. 🔄 **Inventory/Transactions/Reports** - Core features
5. 🔄 **AddArtwork forms** - Most complex
6. 🔄 **Components** - Reusable UI elements

## Verification

After migration, verify:
1. Light mode looks correct
2. Dark mode looks correct
3. Hover states work
4. Focus states visible
5. Contrast ratios meet WCAG AA (use browser devtools)
6. No visual regressions (compare to Dashboard)
