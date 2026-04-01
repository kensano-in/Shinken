/**
 * SHINKEN — Chat Preview Module
 * Animates a live chat demo with typewriter-style messages
 */

const DEMO_MESSAGES = [
  { text: 'Hey! ShinChat is almost here 🔥', own: false, delay: 500 },
  { text: 'I know, the UI is already looking 🔥', own: true,  delay: 1800 },
  { text: 'End-to-end encrypted too?', own: false, delay: 3200 },
  { text: 'Always. Privacy-first by design 🔐', own: true, delay: 4400 },
  { text: 'Can\'t wait. When does it launch?', own: false, delay: 5800 },
  { text: 'Very soon — you\'ll be first to know ⚡', own: true, delay: 7000 },
];

export class ChatPreview {
  constructor(containerEl) {
    this.container = containerEl;
    this.msgArea = containerEl.querySelector('.chat-messages');
    this.typingEl = containerEl.querySelector('.chat-typing');
    this.inputEl = containerEl.querySelector('.chat-input-field');
    this.sendBtn = containerEl.querySelector('.chat-send-btn');
    this._timers = [];
    this._running = false;
  }

  _addMessage({ text, own }) {
    if (!this.msgArea) return;
    const msg = document.createElement('div');
    msg.className = `chat-msg${own ? ' own' : ''}`;
    msg.innerHTML = `
      <div class="chat-msg-avatar">${own ? 'U' : 'S'}</div>
      <div class="chat-bubble">${text}</div>
    `;
    msg.style.animationDelay = '0ms';
    this.msgArea.insertBefore(msg, this.typingEl);
    this.msgArea.scrollTop = this.msgArea.scrollHeight;
  }

  _schedule(fn, delay) {
    const t = setTimeout(fn, delay);
    this._timers.push(t);
  }

  start() {
    if (this._running) return;
    this._running = true;

    DEMO_MESSAGES.forEach((msg, i) => {
      // show typing indicator before each non-own message
      if (!msg.own) {
        this._schedule(() => {
          if (this.typingEl) this.typingEl.style.display = 'flex';
        }, msg.delay - 700);
      }
      this._schedule(() => {
        if (this.typingEl) this.typingEl.style.display = 'none';
        this._addMessage(msg);
      }, msg.delay);
    });

    // loop after all messages
    this._schedule(() => {
      this.restart();
    }, 10000);
  }

  restart() {
    this.stop();
    if (this.msgArea) {
      // keep only typing indicator
      const typing = this.typingEl;
      this.msgArea.innerHTML = '';
      if (typing) this.msgArea.appendChild(typing);
    }
    this.start();
  }

  stop() {
    this._running = false;
    this._timers.forEach(clearTimeout);
    this._timers = [];
  }

  initInput() {
    if (!this.sendBtn || !this.inputEl) return;
    const send = () => {
      const val = this.inputEl.value.trim();
      if (!val) return;
      this._addMessage({ text: val, own: true });
      this.inputEl.value = '';
      this.inputEl.focus();
    };
    this.sendBtn.addEventListener('click', send);
    this.inputEl.addEventListener('keydown', e => {
      if (e.key === 'Enter') send();
    });
  }
}
