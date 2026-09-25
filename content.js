(() => {
  if (globalThis.__screenClipReaderLoaded) return;
  globalThis.__screenClipReaderLoaded = true;

  function beginSelection() {
    if (document.querySelector('#screen-clip-reader-overlay')) return;

    const overlay = document.createElement('div');
    overlay.id = 'screen-clip-reader-overlay';
    Object.assign(overlay.style, {
      position: 'fixed', inset: '0', zIndex: '2147483647', cursor: 'crosshair',
      background: 'rgba(10, 20, 35, .28)', userSelect: 'none'
    });
    const hint = document.createElement('div');
    hint.textContent = 'Drag to select • Esc to cancel';
    Object.assign(hint.style, {
      position: 'fixed', top: '18px', left: '50%', transform: 'translateX(-50%)',
      padding: '9px 14px', borderRadius: '999px', background: '#111827', color: 'white',
      font: '600 13px system-ui', boxShadow: '0 5px 24px rgba(0,0,0,.3)'
    });
    const box = document.createElement('div');
    Object.assign(box.style, {
      position: 'fixed', display: 'none', border: '2px solid #60a5fa',
      background: 'rgba(96, 165, 250, .14)', boxShadow: '0 0 0 9999px rgba(0,0,0,.38)'
    });
    overlay.append(hint, box);
    document.documentElement.append(overlay);

    let startX = 0;
    let startY = 0;
    let dragging = false;

    const cancel = () => {
      overlay.remove();
      window.removeEventListener('keydown', onKey, true);
    };
    const onKey = event => {
      if (event.key === 'Escape') cancel();
    };
    window.addEventListener('keydown', onKey, true);

    overlay.addEventListener('pointerdown', event => {
      dragging = true;
      startX = event.clientX;
      startY = event.clientY;
      box.style.display = 'block';
    });
    overlay.addEventListener('pointermove', event => {
      if (!dragging) return;
      const left = Math.min(startX, event.clientX);
      const top = Math.min(startY, event.clientY);
      Object.assign(box.style, {
        left: `${left}px`, top: `${top}px`,
        width: `${Math.abs(event.clientX - startX)}px`,
        height: `${Math.abs(event.clientY - startY)}px`
      });
    });
    overlay.addEventListener('pointerup', async event => {
      if (!dragging) return;
      dragging = false;
      const rect = {
        x: Math.min(startX, event.clientX),
        y: Math.min(startY, event.clientY),
        width: Math.abs(event.clientX - startX),
        height: Math.abs(event.clientY - startY)
      };
      cancel();
      if (rect.width < 8 || rect.height < 8) return;
      await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      chrome.runtime.sendMessage({
        type: 'CAPTURE_SELECTION', rect, devicePixelRatio: window.devicePixelRatio
      });
    });
  }

  function readYouTubeText() {
    if (!location.hostname.endsWith('youtube.com')) {
      return { ok: false, error: 'This feature is available on YouTube pages.' };
    }
    const transcriptSegments = [...document.querySelectorAll('ytd-transcript-segment-renderer, .ytd-transcript-segment-renderer')]
      .map(node => node.innerText?.trim())
      .filter(Boolean);
    if (transcriptSegments.length) {
      return { ok: true, text: transcriptSegments.join('\n') };
    }
    const visibleCaptions = [...document.querySelectorAll('.ytp-caption-segment')]
      .map(node => node.textContent?.trim())
      .filter(Boolean);
    if (visibleCaptions.length) {
      return { ok: true, text: [...new Set(visibleCaptions)].join(' ') };
    }
    return { ok: false, error: 'No visible captions or open transcript found. Turn on captions or open Show transcript.' };
  }

  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message.type === 'START_SELECTION') {
      beginSelection();
      sendResponse({ ok: true });
    }
    if (message.type === 'READ_YOUTUBE_TEXT') sendResponse(readYouTubeText());
  });
})();
