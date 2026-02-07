import { useEffect, useCallback } from 'react';

export interface KeyboardShortcutHandlers {
  onNew?: () => void;           // N - Create new shoot
  onSearch?: () => void;        // Cmd+F or / - Focus search
  onDelete?: () => void;        // Del or Backspace - Delete selected
  onEdit?: () => void;          // E - Edit selected
  onClose?: () => void;         // Escape - Close modal/form
  onSave?: () => void;          // Cmd+S - Save form
  onDuplicate?: () => void;     // D - Duplicate selected
  onNavigateUp?: () => void;    // Arrow Up - Navigate table
  onNavigateDown?: () => void;  // Arrow Down - Navigate table
  onSelect?: () => void;        // Enter - Select/open item
}

/**
 * Custom hook for keyboard shortcuts in AdminDashboard and other components
 *
 * Shortcuts:
 * - N: New shoot (when not in input)
 * - Cmd/Ctrl + F: Focus search
 * - /: Focus search (vim-style)
 * - E: Edit selected shoot
 * - D: Duplicate selected shoot
 * - Delete/Backspace: Delete selected shoot
 * - Escape: Close modal or cancel action
 * - Cmd/Ctrl + S: Save form (prevents default browser save)
 * - Arrow Up/Down: Navigate table rows
 * - Enter: Open selected item
 */
export function useKeyboardShortcuts(
  handlers: KeyboardShortcutHandlers,
  enabled: boolean = true
) {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return;

    const target = event.target as HTMLElement;
    const tagName = target.tagName.toLowerCase();
    const isInput = tagName === 'input' || tagName === 'textarea' || tagName === 'select';
    const isContentEditable = target.isContentEditable;

    // Check for modifier keys
    const isMeta = event.metaKey || event.ctrlKey;

    // Cmd/Ctrl + S: Save (always capture to prevent browser save dialog)
    if (isMeta && event.key === 's') {
      event.preventDefault();
      handlers.onSave?.();
      return;
    }

    // Cmd/Ctrl + F: Focus search
    if (isMeta && event.key === 'f') {
      event.preventDefault();
      handlers.onSearch?.();
      return;
    }

    // Escape: Close modal (works even in inputs)
    if (event.key === 'Escape') {
      handlers.onClose?.();
      return;
    }

    // Skip other shortcuts if user is typing in an input
    if (isInput || isContentEditable) return;

    // Single key shortcuts (only when not in input)
    switch (event.key.toLowerCase()) {
      case 'n':
        event.preventDefault();
        handlers.onNew?.();
        break;

      case '/':
        event.preventDefault();
        handlers.onSearch?.();
        break;

      case 'e':
        event.preventDefault();
        handlers.onEdit?.();
        break;

      case 'd':
        event.preventDefault();
        handlers.onDuplicate?.();
        break;

      case 'delete':
      case 'backspace':
        event.preventDefault();
        handlers.onDelete?.();
        break;

      case 'arrowup':
        event.preventDefault();
        handlers.onNavigateUp?.();
        break;

      case 'arrowdown':
        event.preventDefault();
        handlers.onNavigateDown?.();
        break;

      case 'enter':
        event.preventDefault();
        handlers.onSelect?.();
        break;
    }
  }, [handlers, enabled]);

  useEffect(() => {
    if (!enabled) return;

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown, enabled]);
}

/**
 * Hook for form-specific keyboard shortcuts (save with Cmd+S)
 */
export function useFormShortcuts(onSave: () => void, enabled: boolean = true) {
  useKeyboardShortcuts({
    onSave,
    onClose: () => {
      // Optional: could navigate away on Escape
    }
  }, enabled);
}
