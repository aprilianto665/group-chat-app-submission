# Component Library - Atomic Design

This project follows the atomic design methodology to create reusable and maintainable components.

## Structure

### Atoms

Basic building blocks that cannot be broken down further:

- **Logo**: Company logo with customizable styling
- **Input**: Form input with label, error handling, and validation
- **Button**: Reusable button with variants (primary, secondary, outline) and sizes
- **Checkbox**: Form checkbox with label and error handling
- **Heading**: Semantic heading component with different levels

### Molecules

Simple combinations of atoms that form functional units:

- **FormField**: Input with label and validation (Input + Label)
- **RememberMeCheckbox**: Checkbox specifically for "Remember me" functionality
- **PageHeader**: Logo + Title combination for page headers

### Organisms

Complex components made of molecules and atoms:

- **LoginForm**: Complete login form with validation and state management
- **LoginIllustration**: Illustration component for login page

## Usage

```tsx
import { LoginForm, PageHeader, LoginIllustration } from '@/components';

// Use in your page
<PageHeader title="Sign in" subtitle="Dashboard" />
<LoginForm onSubmit={handleLogin} isLoading={false} />
<LoginIllustration />
```

## Features

- ✅ TypeScript support
- ✅ Responsive design
- ✅ Form validation
- ✅ Loading states
- ✅ Error handling
- ✅ Accessibility features
- ✅ Reusable and composable
- ✅ Clean code architecture
