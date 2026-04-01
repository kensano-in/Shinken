/**
 * SHINKEN — Toast Notification System
 * Export: notify(title, message, type?, duration?)
 * Types: 'default' | 'success' | 'warn' | 'info'
 */

const ICONS = {
  default: '⚡',
  success: '✓',
  warn:    '⚠',
  info:    'ⓘ',
};

let container = null;

function getContainer() {
  if (container) return container;
  container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }
  return container;
}

function removeToast(el) {
  el.classList.add('removing');
  el.addEventListener('animationend', () => el.remove(), { once: true });
}

/**
 * Show a toast notification.
 * @param {string} title
 * @param {string} [message]
 * @param {'default'|'success'|'warn'|'info'} [type='default']
 * @param {number} [duration=4000] ms before auto-dismiss (0 = no auto-dismiss)
 */
export function notify(title, message = '', type = 'default', duration = 4000) {
  const c = getContainer();
  const toast = document.createElement('div');
  toast.className = `toast${type !== 'default' ? ` toast-${type}` : ''}`;
  toast.innerHTML = `
    <span class="toast-icon">${ICONS[type] ?? ICONS.default}</span>
    <div class="toast-body">
      <div class="toast-title">${title}</div>
      ${message ? `<div class="toast-msg">${message}</div>` : ''}
    </div>
    <button class="toast-close" aria-label="Dismiss">×</button>
  `;

  toast.querySelector('.toast-close').addEventListener('click', () => removeToast(toast));

  c.appendChild(toast);

  if (duration > 0) {
    setTimeout(() => removeToast(toast), duration);
  }

  return toast;
}

/** Convenience wrappers */
export const notifySuccess = (title, msg, dur) => notify(title, msg, 'success', dur);
export const notifyWarn    = (title, msg, dur) => notify(title, msg, 'warn', dur);
export const notifyInfo    = (title, msg, dur) => notify(title, msg, 'info', dur);
