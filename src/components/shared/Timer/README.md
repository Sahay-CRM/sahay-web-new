# Timer Component

A reusable countdown timer component with automatic start/stop functionality and individual tab time tracking.

## Features

- **Automatic Timer**: Timer starts automatically when tab is active, stops when switching tabs
- **Individual Tab Tracking**: Tracks time spent on each individual tab
- **Countdown Display**: Shows remaining time in MM:SS format
- **Time Spent Display**: Shows time spent on current tab
- **Edit Functionality**: Click the pen icon to edit the timer duration in minutes
- **Responsive Design**: Works well in different container sizes
- **Customizable**: Accepts initial time and callback for time changes

## Usage

```tsx
import Timer from '@/components/shared/Timer';

// Basic usage with automatic start/stop
<Timer
  initialMinutes={30}
  isActive={activeTab === "agenda"}
  onTimeSpent={(seconds) => console.log('Time spent:', seconds)}
/>

// With callback for time changes
<Timer
  initialMinutes={45}
  isActive={activeTab === "tasks"}
  onTimeChange={(minutes) => console.log('Timer changed to:', minutes)}
  onTimeSpent={(seconds) => handleTimeSpent("tasks", seconds)}
  className="custom-styles"
/>
```

## Props

- `initialMinutes` (number, optional): Initial timer duration in minutes (default: 30)
- `isActive` (boolean, optional): Whether the timer should be running (default: false)
- `onTimeChange` (function, optional): Callback called when timer duration is changed
- `onTimeSpent` (function, optional): Callback called with seconds spent on this tab
- `className` (string, optional): Additional CSS classes

## Features

1. **Automatic Start/Stop**: Timer automatically starts when `isActive` is true, stops when false
2. **Time Display**: Shows current time remaining in MM:SS format
3. **Time Spent Tracking**: Displays time spent on the current tab
4. **Edit Mode**: Click the pen icon to enter edit mode
5. **Time Input**: Enter new duration in minutes (1-999)
6. **Auto-stop**: Timer automatically stops when it reaches zero

## Integration

The timer is integrated into the meeting UI tab headers, providing:

- Automatic timer start when clicking on a tab
- Timer stop when switching to another tab
- Individual time tracking for each meeting section
- Visual display of time spent on each tab
- Ability to edit time limits during the meeting

## Behavior

- **Tab Click**: Timer automatically starts counting down
- **Tab Switch**: Timer stops and tracks time spent
- **Time Display**: Shows both remaining time and time spent
- **Edit Time**: Click pen icon to change duration
- **Visual Feedback**: Clear indication of active/inactive state
