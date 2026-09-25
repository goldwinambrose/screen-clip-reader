const statusEl = document.querySelector('#status');

async function activeTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) throw new Error('No active tab found.');
  if (/^(chrome|edge|about|view-source):/.test(tab.url || '')) throw new Error('Chrome does not allow extensions to capture this protected page.');
  return tab;
}

document.querySelector('#select').addEventListener('click', async () => {
  try {
    const tab = await activeTab();
    const response = await chrome.tabs.sendMessage(tab.id, { type: 'START_SELECTION' });
    if (!response?.ok) throw new Error('Could not start selection. Reload the page and try again.');
    window.close();
  } catch (error) {
    statusEl.textContent = error.message;
  }
});

document.querySelector('#youtube').addEventListener('click', async () => {
  try {
    const tab = await activeTab();
    const response = await chrome.tabs.sendMessage(tab.id, { type: 'READ_YOUTUBE_TEXT' });
    if (!response?.ok) throw new Error(response?.error || 'No caption text found.');
    await navigator.clipboard.writeText(response.text);
    statusEl.textContent = `Copied ${response.text.length.toLocaleString()} characters.`;
  } catch (error) {
    statusEl.textContent = error.message;
  }
});
