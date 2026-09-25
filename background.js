chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type !== 'CAPTURE_SELECTION') return;

  (async () => {
    const tab = sender.tab;
    if (!tab?.windowId) throw new Error('The source tab is unavailable.');
    const dataUrl = await chrome.tabs.captureVisibleTab(tab.windowId, { format: 'png' });
    await chrome.storage.local.set({
      latestCapture: {
        dataUrl,
        rect: message.rect,
        devicePixelRatio: message.devicePixelRatio || 1,
        sourceTitle: tab.title || 'Screen capture',
        sourceUrl: tab.url || '',
        capturedAt: new Date().toISOString()
      }
    });
    await chrome.tabs.create({ url: chrome.runtime.getURL('result.html') });
    sendResponse({ ok: true });
  })().catch(error => sendResponse({ ok: false, error: error.message }));

  return true;
});
