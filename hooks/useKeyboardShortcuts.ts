import { useEffect } from 'react';

interface KeyboardShortcutHandlers {
  onNew?: () => void;
  onSearch?: () => void;
  onEdit?: () => void;
  onDuplicate?: () => void;
  onDelete?: () => void;
  onClose?: () => void;
  onNavigateUp?: () => void;
  onNavigateDown?: () => void;
  onSelect?: () => void;
}

const isEditableTarget = (target: EventTarget | null): boolean => {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable) return true;

  const tagName = target.tagName;
  return tagName === 'INPUT' || tagName === 'TEXTAREA' || tagName === 'SELECT';
};

export function useKeyboardShortcuts(
  handlers: KeyboardShortcutHandlers,
  enabled: boolean = true
): void {
  useEffect(() => {
    if (!enabled) return;

    const onKeyDown = (event: KeyboardEvent) => {
      const inEditable = isEditableTarget(event.target);
      const key = event.key.toLowerCase();

      if (event.key === 'Escape') {
        handlers.onClose?.();
        return;
      }

      if (inEditable) {
        if ((event.metaKey || event.ctrlKey) && key === 'f') {
          event.preventDefault();
          handlers.onSearch?.();
        }
        return;
      }

      switch (event.key) {
        case '/':
          event.preventDefault();
          handlers.onSearch?.();
          break;
        case 'Enter':
          handlers.onSelect?.();
          break;
        case 'ArrowUp':
          event.preventDefault();
          handlers.onNavigateUp?.();
          break;
        case 'ArrowDown':
          event.preventDefault();
          handlers.onNavigateDown?.();
          break;
        case 'Delete':
        case 'Backspace':
          handlers.onDelete?.();
          break;
        default:
          break;
      }

      if (key === 'n') {
        handlers.onNew?.();
      } else if (key === 'e') {
        handlers.onEdit?.();
      } else if (key === 'd') {
        handlers.onDuplicate?.();
      } else if ((event.metaKey || event.ctrlKey) && key === 'f') {
        event.preventDefault();
        handlers.onSearch?.();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [enabled, handlers]);
}
