# Task Management Dashboard

A modern, responsive Task Management Dashboard built with SvelteKit, TypeScript, and Tailwind CSS. This application provides a clean, intuitive interface for managing tasks with full CRUD operations, filtering, sorting, and real-time updates.

## 🚀 Features

### Core Functionality
- **Task Management**: Create, read, update, and delete tasks
- **Task Status**: Track tasks through pending, in-progress, and completed states
- **Rich Task Details**: Add titles, descriptions, and timestamps
- **Real-time Updates**: Instant UI updates with optimistic updates

### User Experience
- **Responsive Design**: Seamless experience across mobile, tablet, and desktop
- **Dark Mode**: Toggle between light, dark, and system themes
- **View Modes**: Switch between grid and list layouts
- **Search & Filter**: Find tasks by title/description and filter by status
- **Sorting**: Sort by title, date, or status with ascending/descending options
- **Drag & Drop**: Reorder tasks by dragging with SortableJS integration
- **Animations**: Smooth transitions and hover effects

### Accessibility
- **WCAG Compliant**: Proper ARIA attributes and semantic HTML
- **Keyboard Navigation**: Full keyboard support for all interactions
- **Screen Reader Support**: Descriptive labels and live regions
- **Focus Management**: Proper focus trapping in modals

### Technical Features
- **Type Safety**: Full TypeScript implementation
- **State Management**: Reactive Svelte stores
- **Component Architecture**: Reusable, modular components
- **Error Handling**: User-friendly error messages and recovery
- **Local Storage**: Persistent UI preferences
- **Mock API**: Simulated backend with realistic delays

## 🛠️ Technology Stack

- **Framework**: SvelteKit 2.x
- **Language**: TypeScript
- **Styling**: Tailwind CSS 3.x
- **Drag & Drop**: SortableJS
- **Testing**: Vitest with 80%+ coverage
- **Linting**: ESLint with TypeScript support
- **Formatting**: Prettier
- **Build Tool**: Vite

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

## 🏗️ Project Structure

```
src/
├── lib/
│   ├── components/          # Reusable Svelte components
│   │   ├── TaskCard.svelte     # Individual task display
│   │   ├── TaskForm.svelte     # Create/edit task form
│   │   ├── FilterBar.svelte    # Search, filter, and sort controls
│   │   ├── ConfirmationDialog.svelte # Delete confirmation
│   │   ├── Modal.svelte        # Generic modal wrapper
│   │   ├── NotificationToast.svelte # Toast notifications
│   │   ├── ThemeToggle.svelte  # Dark mode toggle
│   │   └── index.ts            # Component exports
│   ├── stores/              # Svelte stores for state management
│   │   ├── taskStore.ts        # Task data and operations
│   │   ├── uiStore.ts          # UI state and preferences
│   │   └── index.ts            # Store exports
│   ├── types.ts             # TypeScript type definitions
│   ├── utils.ts             # Utility functions
│   ├── api.ts               # Mock API implementation
│   └── mockData.ts          # Sample task data
├── routes/                  # SvelteKit routes
│   ├── +layout.svelte          # Global layout
│   └── +page.svelte            # Main dashboard page
├── test/                    # Test configuration
│   └── setup.ts                # Test setup and mocks
├── app.css                  # Global styles and Tailwind imports
└── app.html                 # HTML template
```

## 🎨 Component Architecture

### Core Components

#### `TaskCard`
Displays individual tasks with:
- Status indicators and icons
- Edit and delete actions
- Status change dropdown
- Responsive grid/list layouts

#### `TaskForm`
Handles task creation and editing:
- Form validation with real-time feedback
- Character counters
- Accessibility features
- Loading states

#### `FilterBar`
Provides task filtering and sorting:
- Search by title/description
- Filter by status
- Sort by multiple fields
- View mode toggle
- Results counter

#### `Modal`
Generic modal wrapper with:
- Focus trapping
- Escape key handling
- Backdrop click dismissal
- Accessible markup

### State Management

#### `taskStore`
Manages task data and operations:
- CRUD operations with API integration
- Filtering and sorting logic
- Loading and error states
- Derived stores for computed values

#### `uiStore`
Handles UI state and preferences:
- Modal visibility states
- Theme preferences
- View mode settings
- Notification system
- Selection state for bulk operations

## 🧪 Testing

The project includes comprehensive unit tests with 80%+ coverage.

### Running Tests

```bash
# Run tests once
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run tests with UI
npm run test:ui
```

### Test Coverage

- **Utilities**: 95%+ coverage of all utility functions
- **Stores**: 85%+ coverage of store logic and actions
- **API**: 100% coverage of mock API operations
- **Types**: Full TypeScript type safety

### Testing Strategy

- **Unit Tests**: Individual function and store testing
- **Integration Tests**: Component interaction testing
- **Mock API**: Realistic API simulation with delays
- **Error Scenarios**: Comprehensive error handling tests

## 🎛️ Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run build            # Build for production
npm run preview          # Preview production build

# Code Quality
npm run lint             # Run ESLint
npm run lint:fix         # Fix ESLint issues
npm run format           # Format code with Prettier
npm run format:check     # Check code formatting

# Testing
npm test                 # Run tests once
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Run tests with coverage
npm run test:ui          # Run tests with UI

# Type Checking
npm run check            # Run Svelte type checking
npm run check:watch      # Run type checking in watch mode
```

## 🎨 Design Decisions

### UI/UX Choices

1. **Clean Interface**: Minimal design focusing on task content
2. **Consistent Spacing**: 4px grid system via Tailwind
3. **Color System**: Blue primary with semantic status colors
4. **Typography**: Inter font for modern readability
5. **Responsive Breakpoints**: Mobile-first approach

### Technical Decisions

1. **SvelteKit**: Chosen for excellent DX and performance
2. **TypeScript**: Full type safety and better IDE support
3. **Tailwind CSS**: Utility-first CSS for rapid development
4. **Svelte Stores**: Native state management solution
5. **Mock API**: Realistic simulation without backend dependency

### Architecture Patterns

1. **Component Composition**: Reusable, single-responsibility components
2. **Store Pattern**: Centralized state management
3. **Event-Driven**: Component communication via custom events
4. **Derived State**: Computed values using Svelte's reactivity
5. **Error Boundaries**: Graceful error handling and recovery

## 🌟 Key Features Deep Dive

### Task Management
- **CRUD Operations**: Full create, read, update, delete functionality
- **Status Workflow**: Pending → In Progress → Completed
- **Rich Metadata**: Timestamps, descriptions, and validation
- **Optimistic Updates**: Instant UI feedback with error recovery

### Search and Filtering
- **Real-time Search**: Instant results as you type
- **Multi-field Search**: Search in titles and descriptions
- **Status Filtering**: Filter by task status
- **Combined Filters**: Search + status filtering
- **Clear Filters**: Reset all filters with one click

### Sorting Options
- **Multiple Fields**: Sort by title, creation date, update date, or status
- **Sort Direction**: Ascending and descending options
- **Visual Indicators**: Clear sort direction indicators
- **Persistent State**: Sort preferences saved to localStorage

### Responsive Design
- **Mobile First**: Optimized for touch devices
- **Flexible Layouts**: Grid and list view modes
- **Adaptive Components**: Components adjust to screen size
- **Touch Friendly**: Appropriate touch targets and spacing

### Accessibility Features
- **Keyboard Navigation**: Full keyboard support
- **Screen Reader Support**: ARIA labels and live regions
- **Focus Management**: Proper focus trapping in modals
- **Color Contrast**: WCAG AA compliant color ratios
- **Semantic HTML**: Proper heading hierarchy and landmarks

### Theme System
- **Light Mode**: Clean, bright interface
- **Dark Mode**: Easy on the eyes for low-light use
- **System Theme**: Respects OS preference
- **Smooth Transitions**: Animated theme changes
- **Persistent Choice**: Theme preference saved

### Drag & Drop System
- **Task Reordering**: Drag tasks to reorder them in any view
- **Visual Feedback**: Ghost images and drag handles for clear interaction
- **Touch Support**: Works on mobile devices with touch gestures
- **Enable/Disable**: Toggle drag-and-drop functionality on/off
- **Smooth Animations**: Animated transitions during drag operations
- **Cross-Browser**: Compatible with all modern browsers

## 🚀 Performance Optimizations

- **Svelte Compilation**: Optimal bundle size with dead code elimination
- **Lazy Loading**: Components loaded on demand
- **Efficient Updates**: Svelte's fine-grained reactivity
- **Minimal Dependencies**: Carefully selected, lightweight packages
- **CSS Purging**: Unused Tailwind classes removed in production

## 🔧 Configuration

### Environment Variables
No environment variables required for basic functionality.

### Customization
- **Colors**: Modify `tailwind.config.js` for custom color schemes
- **Fonts**: Update font imports in `app.css`
- **API**: Replace mock API with real backend in `api.ts`
- **Themes**: Extend theme system in `uiStore.ts`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes with tests
4. Run the test suite: `npm test`
5. Check code quality: `npm run lint && npm run format:check`
6. Commit your changes: `git commit -m 'Add feature'`
7. Push to the branch: `git push origin feature-name`
8. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **Svelte Team**: For the amazing framework
- **Tailwind CSS**: For the utility-first CSS framework
- **Heroicons**: For the beautiful SVG icons
- **Vitest**: For the fast and modern testing framework

---

Built with ❤️ using SvelteKit, TypeScript, and Tailwind CSS