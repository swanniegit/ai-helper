# CSS Styling Guide

## Overview

This document outlines the comprehensive styling system for the AI Mentor Chat System, including design principles, component styling, responsive design, and theming capabilities.

## Design System

### 1. Color Palette

#### Primary Colors
```css
:root {
  /* Primary Brand Colors */
  --primary-blue: #2563eb;
  --primary-blue-dark: #1d4ed8;
  --primary-blue-light: #3b82f6;
  
  /* Secondary Colors */
  --secondary-purple: #7c3aed;
  --secondary-purple-dark: #6d28d9;
  --secondary-purple-light: #8b5cf6;
  
  /* Accent Colors */
  --accent-green: #10b981;
  --accent-green-dark: #059669;
  --accent-green-light: #34d399;
  
  --accent-orange: #f59e0b;
  --accent-orange-dark: #d97706;
  --accent-orange-light: #fbbf24;
}
```

#### Semantic Colors
```css
:root {
  /* Success States */
  --success-bg: #dcfce7;
  --success-text: #166534;
  --success-border: #bbf7d0;
  
  /* Error States */
  --error-bg: #fef2f2;
  --error-text: #dc2626;
  --error-border: #fecaca;
  
  /* Warning States */
  --warning-bg: #fffbeb;
  --warning-text: #d97706;
  --warning-border: #fed7aa;
  
  /* Info States */
  --info-bg: #eff6ff;
  --info-text: #1d4ed8;
  --info-border: #bfdbfe;
}
```

#### Neutral Colors
```css
:root {
  /* Grayscale */
  --gray-50: #f9fafb;
  --gray-100: #f3f4f6;
  --gray-200: #e5e7eb;
  --gray-300: #d1d5db;
  --gray-400: #9ca3af;
  --gray-500: #6b7280;
  --gray-600: #4b5563;
  --gray-700: #374151;
  --gray-800: #1f2937;
  --gray-900: #111827;
  
  /* Background Colors */
  --bg-primary: #ffffff;
  --bg-secondary: #f9fafb;
  --bg-tertiary: #f3f4f6;
  
  /* Text Colors */
  --text-primary: #111827;
  --text-secondary: #4b5563;
  --text-tertiary: #6b7280;
  --text-inverse: #ffffff;
}
```

### 2. Typography

#### Font Stack
```css
:root {
  /* Font Families */
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
  --font-serif: 'Georgia', 'Times New Roman', serif;
}
```

#### Font Sizes
```css
:root {
  /* Text Sizes */
  --text-xs: 0.75rem;    /* 12px */
  --text-sm: 0.875rem;   /* 14px */
  --text-base: 1rem;     /* 16px */
  --text-lg: 1.125rem;   /* 18px */
  --text-xl: 1.25rem;    /* 20px */
  --text-2xl: 1.5rem;    /* 24px */
  --text-3xl: 1.875rem;  /* 30px */
  --text-4xl: 2.25rem;   /* 36px */
  --text-5xl: 3rem;      /* 48px */
  --text-6xl: 3.75rem;   /* 60px */
}
```

#### Font Weights
```css
:root {
  --font-light: 300;
  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;
  --font-extrabold: 800;
}
```

### 3. Spacing System

#### Spacing Scale
```css
:root {
  /* Spacing Units */
  --space-0: 0;
  --space-1: 0.25rem;   /* 4px */
  --space-2: 0.5rem;    /* 8px */
  --space-3: 0.75rem;   /* 12px */
  --space-4: 1rem;      /* 16px */
  --space-5: 1.25rem;   /* 20px */
  --space-6: 1.5rem;    /* 24px */
  --space-8: 2rem;      /* 32px */
  --space-10: 2.5rem;   /* 40px */
  --space-12: 3rem;     /* 48px */
  --space-16: 4rem;     /* 64px */
  --space-20: 5rem;     /* 80px */
  --space-24: 6rem;     /* 96px */
}
```

### 4. Border Radius

```css
:root {
  /* Border Radius */
  --radius-none: 0;
  --radius-sm: 0.125rem;   /* 2px */
  --radius-base: 0.25rem;  /* 4px */
  --radius-md: 0.375rem;   /* 6px */
  --radius-lg: 0.5rem;     /* 8px */
  --radius-xl: 0.75rem;    /* 12px */
  --radius-2xl: 1rem;      /* 16px */
  --radius-3xl: 1.5rem;    /* 24px */
  --radius-full: 9999px;
}
```

### 5. Shadows

```css
:root {
  /* Box Shadows */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-base: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
  --shadow-2xl: 0 25px 50px -12px rgb(0 0 0 / 0.25);
}
```

## Component Styling

### 1. Chat Interface Components

#### Chat Container
```css
.chat-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: var(--bg-primary);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  overflow: hidden;
}

.chat-header {
  padding: var(--space-4) var(--space-6);
  background: linear-gradient(135deg, var(--primary-blue), var(--secondary-purple));
  color: var(--text-inverse);
  border-bottom: 1px solid var(--gray-200);
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-4);
  background: var(--bg-secondary);
}

.chat-input-container {
  padding: var(--space-4);
  background: var(--bg-primary);
  border-top: 1px solid var(--gray-200);
}
```

#### Message Bubbles
```css
.message {
  margin-bottom: var(--space-4);
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
}

.message.user {
  flex-direction: row-reverse;
}

.message-bubble {
  max-width: 70%;
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-lg);
  position: relative;
  word-wrap: break-word;
}

.message.user .message-bubble {
  background: var(--primary-blue);
  color: var(--text-inverse);
  border-bottom-right-radius: var(--radius-sm);
}

.message.assistant .message-bubble {
  background: var(--bg-primary);
  color: var(--text-primary);
  border: 1px solid var(--gray-200);
  border-bottom-left-radius: var(--radius-sm);
}

.message-avatar {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-full);
  background: var(--gray-300);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: var(--font-semibold);
  color: var(--text-secondary);
}
```

#### Input Components
```css
.chat-input {
  display: flex;
  gap: var(--space-3);
  align-items: flex-end;
}

.input-field {
  flex: 1;
  min-height: 44px;
  max-height: 120px;
  padding: var(--space-3) var(--space-4);
  border: 1px solid var(--gray-300);
  border-radius: var(--radius-lg);
  background: var(--bg-primary);
  color: var(--text-primary);
  font-family: var(--font-sans);
  font-size: var(--text-base);
  resize: vertical;
  outline: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.input-field:focus {
  border-color: var(--primary-blue);
  box-shadow: 0 0 0 3px rgb(37 99 235 / 0.1);
}

.send-button {
  padding: var(--space-3) var(--space-4);
  background: var(--primary-blue);
  color: var(--text-inverse);
  border: none;
  border-radius: var(--radius-lg);
  font-weight: var(--font-medium);
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.send-button:hover {
  background: var(--primary-blue-dark);
}

.send-button:disabled {
  background: var(--gray-300);
  cursor: not-allowed;
}
```

### 2. Navigation Components

#### Sidebar Navigation
```css
.sidebar {
  width: 280px;
  background: var(--bg-primary);
  border-right: 1px solid var(--gray-200);
  height: 100vh;
  overflow-y: auto;
}

.sidebar-header {
  padding: var(--space-6);
  border-bottom: 1px solid var(--gray-200);
}

.nav-menu {
  padding: var(--space-4);
}

.nav-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-lg);
  color: var(--text-secondary);
  text-decoration: none;
  transition: all 0.2s ease;
}

.nav-item:hover {
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.nav-item.active {
  background: var(--primary-blue);
  color: var(--text-inverse);
}

.nav-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}
```

### 3. Form Components

#### Input Fields
```css
.form-group {
  margin-bottom: var(--space-4);
}

.form-label {
  display: block;
  margin-bottom: var(--space-2);
  font-weight: var(--font-medium);
  color: var(--text-primary);
}

.form-input {
  width: 100%;
  padding: var(--space-3) var(--space-4);
  border: 1px solid var(--gray-300);
  border-radius: var(--radius-lg);
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: var(--text-base);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.form-input:focus {
  outline: none;
  border-color: var(--primary-blue);
  box-shadow: 0 0 0 3px rgb(37 99 235 / 0.1);
}

.form-input.error {
  border-color: var(--error-text);
}

.form-error {
  margin-top: var(--space-1);
  color: var(--error-text);
  font-size: var(--text-sm);
}
```

#### Buttons
```css
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-6);
  border: none;
  border-radius: var(--radius-lg);
  font-weight: var(--font-medium);
  font-size: var(--text-base);
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
}

.btn-primary {
  background: var(--primary-blue);
  color: var(--text-inverse);
}

.btn-primary:hover {
  background: var(--primary-blue-dark);
}

.btn-secondary {
  background: var(--bg-secondary);
  color: var(--text-primary);
  border: 1px solid var(--gray-300);
}

.btn-secondary:hover {
  background: var(--gray-100);
}

.btn-success {
  background: var(--accent-green);
  color: var(--text-inverse);
}

.btn-success:hover {
  background: var(--accent-green-dark);
}

.btn-danger {
  background: var(--error-text);
  color: var(--text-inverse);
}

.btn-danger:hover {
  background: #b91c1c;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
```

### 4. Card Components

```css
.card {
  background: var(--bg-primary);
  border: 1px solid var(--gray-200);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
}

.card-header {
  padding: var(--space-4) var(--space-6);
  border-bottom: 1px solid var(--gray-200);
  background: var(--bg-secondary);
}

.card-body {
  padding: var(--space-6);
}

.card-footer {
  padding: var(--space-4) var(--space-6);
  border-top: 1px solid var(--gray-200);
  background: var(--bg-secondary);
}
```

## Responsive Design

### 1. Breakpoints

```css
/* Mobile First Approach */
:root {
  --breakpoint-sm: 640px;
  --breakpoint-md: 768px;
  --breakpoint-lg: 1024px;
  --breakpoint-xl: 1280px;
  --breakpoint-2xl: 1536px;
}

/* Mobile */
@media (max-width: 639px) {
  .chat-container {
    height: 100vh;
    border-radius: 0;
  }
  
  .sidebar {
    position: fixed;
    left: -100%;
    transition: left 0.3s ease;
    z-index: 50;
  }
  
  .sidebar.open {
    left: 0;
  }
}

/* Tablet */
@media (min-width: 640px) and (max-width: 1023px) {
  .chat-container {
    margin: var(--space-4);
    height: calc(100vh - 2rem);
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .chat-container {
    margin: var(--space-6);
    height: calc(100vh - 3rem);
  }
}
```

### 2. Responsive Utilities

```css
/* Hide/Show utilities */
.hidden { display: none; }
.block { display: block; }
.inline { display: inline; }
.inline-block { display: inline-block; }

/* Responsive visibility */
@media (min-width: 640px) {
  .sm\:hidden { display: none; }
  .sm\:block { display: block; }
}

@media (min-width: 768px) {
  .md\:hidden { display: none; }
  .md\:block { display: block; }
}

@media (min-width: 1024px) {
  .lg\:hidden { display: none; }
  .lg\:block { display: block; }
}
```

## Animation and Transitions

### 1. Micro-interactions

```css
/* Fade In Animation */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fade-in {
  animation: fadeIn 0.3s ease-out;
}

/* Slide In Animation */
@keyframes slideIn {
  from {
    transform: translateX(-100%);
  }
  to {
    transform: translateX(0);
  }
}

.slide-in {
  animation: slideIn 0.3s ease-out;
}

/* Pulse Animation */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
```

### 2. Loading States

```css
.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid var(--gray-300);
  border-top: 2px solid var(--primary-blue);
  border-radius: var(--radius-full);
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.skeleton {
  background: linear-gradient(90deg, var(--gray-200) 25%, var(--gray-100) 50%, var(--gray-200) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
```

## Theming System

### 1. Dark Mode Support

```css
/* Dark Mode Variables */
[data-theme="dark"] {
  --bg-primary: #111827;
  --bg-secondary: #1f2937;
  --bg-tertiary: #374151;
  
  --text-primary: #f9fafb;
  --text-secondary: #d1d5db;
  --text-tertiary: #9ca3af;
  
  --gray-50: #111827;
  --gray-100: #1f2937;
  --gray-200: #374151;
  --gray-300: #4b5563;
  --gray-400: #6b7280;
  --gray-500: #9ca3af;
  --gray-600: #d1d5db;
  --gray-700: #e5e7eb;
  --gray-800: #f3f4f6;
  --gray-900: #f9fafb;
}

/* Dark Mode Message Bubbles */
[data-theme="dark"] .message.assistant .message-bubble {
  background: var(--bg-tertiary);
  border-color: var(--gray-600);
  color: var(--text-primary);
}
```

### 2. Theme Switching

```css
/* Theme Transition */
* {
  transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
}

/* Theme Toggle Button */
.theme-toggle {
  position: fixed;
  bottom: var(--space-6);
  right: var(--space-6);
  width: 48px;
  height: 48px;
  border-radius: var(--radius-full);
  background: var(--bg-primary);
  border: 1px solid var(--gray-300);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-lg);
  z-index: 100;
}
```

## Accessibility

### 1. Focus Management

```css
/* Focus Styles */
.focus-visible {
  outline: 2px solid var(--primary-blue);
  outline-offset: 2px;
}

/* Skip Links */
.skip-link {
  position: absolute;
  top: -40px;
  left: 6px;
  background: var(--primary-blue);
  color: var(--text-inverse);
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-base);
  text-decoration: none;
  z-index: 1000;
}

.skip-link:focus {
  top: 6px;
}
```

### 2. Screen Reader Support

```css
/* Visually Hidden */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* High Contrast Mode */
@media (prefers-contrast: high) {
  :root {
    --primary-blue: #0000ff;
    --text-primary: #000000;
    --bg-primary: #ffffff;
  }
}
```

## Performance Optimization

### 1. CSS Optimization

```css
/* Use CSS Custom Properties for Dynamic Values */
.dynamic-color {
  color: var(--dynamic-color, var(--text-primary));
}

/* Optimize Animations */
.optimized-animation {
  will-change: transform, opacity;
  transform: translateZ(0);
}

/* Reduce Paint Operations */
.no-paint {
  transform: translate3d(0, 0, 0);
}
```

### 2. Critical CSS

```css
/* Critical Path CSS */
.critical {
  /* Essential styles for above-the-fold content */
  display: block;
  visibility: visible;
  opacity: 1;
}

/* Non-critical styles loaded asynchronously */
.non-critical {
  /* Styles that can be loaded after initial render */
}
```

## Best Practices

### 1. CSS Organization

```css
/* 1. CSS Custom Properties */
:root {
  /* Design tokens */
}

/* 2. Base Styles */
* {
  /* Reset and base styles */
}

/* 3. Layout Components */
.container {
  /* Layout-specific styles */
}

/* 4. Component Styles */
.button {
  /* Component-specific styles */
}

/* 5. Utility Classes */
.utility {
  /* Utility classes */
}

/* 6. Media Queries */
@media (min-width: 768px) {
  /* Responsive styles */
}
```

### 2. Naming Conventions

```css
/* BEM Methodology */
.block {}
.block__element {}
.block__element--modifier {}

/* Component-based naming */
.chat-message {}
.chat-message__avatar {}
.chat-message--user {}
.chat-message--assistant {}

/* Utility-first approach */
.flex { display: flex; }
.items-center { align-items: center; }
.justify-between { justify-content: space-between; }
```

### 3. Maintainability

```css
/* Use meaningful variable names */
:root {
  --chat-bubble-user-bg: var(--primary-blue);
  --chat-bubble-assistant-bg: var(--bg-primary);
  --chat-bubble-border-radius: var(--radius-lg);
}

/* Group related styles */
.chat-message {
  /* Layout */
  display: flex;
  gap: var(--space-3);
  
  /* Spacing */
  margin-bottom: var(--space-4);
  
  /* Typography */
  font-size: var(--text-base);
  
  /* Visual */
  border-radius: var(--radius-lg);
}
```

## Conclusion

This CSS styling guide provides a comprehensive foundation for maintaining consistent, accessible, and performant styles across the AI Mentor Chat System. By following these guidelines, developers can ensure a cohesive user experience while maintaining code quality and scalability.

The design system emphasizes:
- **Consistency**: Unified design tokens and component patterns
- **Accessibility**: WCAG compliance and inclusive design
- **Performance**: Optimized animations and efficient CSS
- **Maintainability**: Clear organization and naming conventions
- **Responsiveness**: Mobile-first approach with progressive enhancement 