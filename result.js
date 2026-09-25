const canvas = document.querySelector('#canvas');
const context = canvas.getContext('2d');
const textArea = document.querySelector('#text');
const progressEl = document.querySelector('#progress');
const copyTextButton = document.querySelector('#copyText');
let filename = 'screen-clip.png';

function canvasBlob() {
  return new Promise((resolve, reject) => canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('Could not create the image.')), 'image/png'));
}

async function loadCapture() {
  const { latestCapture } = await chrome.storage.local.get('latestCapture');
  if (!latestCapture) throw new Error('No capture was found. Make a new selection from the extension.');
  const image = new Image();
  image.src = latestCapture.dataUrl;
  await image.decode();
  const scale = latestCapture.devicePixelRatio || 1;
  const { x, y, width, height } = latestCapture.rect;
  canvas.width = Math.round(width * scale);
  canvas.height = Math.round(height * scale);
  context.drawImage(image, Math.round(x * scale), Math.round(y * scale), canvas.width, canvas.height, 0, 0, canvas.width, canvas.height);
  document.querySelector('#source').textContent = latestCapture.sourceTitle;
  filename = `${(latestCapture.sourceTitle || 'screen-clip').replace(/[^a-z0-9-_]+/gi, '-').slice(0, 60)}.png`;
}

document.querySelector('#copyImage').addEventListener('click', async event => {
  try {
    await navigator.clipboard.write([new ClipboardItem({ 'image/png': await canvasBlob() })]);
    event.currentTarget.textContent = 'Copied!';
  } catch (error) {
    progressEl.textContent = `Copy failed: ${error.message}`;
  }
});

document.querySelector('#download').addEventListener('click', async () => {
  const link = document.createElement('a');
  link.download = filename;
  link.href = URL.createObjectURL(await canvasBlob());
  link.click();
  setTimeout(() => URL.revokeObjectURL(link.href), 5000);
});

document.querySelector('#read').addEventListener('click', async event => {
  const button = event.currentTarget;
  button.disabled = true;
  try {
    progressEl.textContent = 'Loading the local OCR engine…';
    const worker = await Tesseract.createWorker('eng', 1, {
      workerPath: chrome.runtime.getURL('vendor/worker.min.js'),
      corePath: chrome.runtime.getURL('vendor/core'),
      langPath: chrome.runtime.getURL('tessdata'),
      workerBlobURL: false,
      logger: message => {
        const percent = message.progress == null ? '' : ` ${Math.round(message.progress * 100)}%`;
        progressEl.textContent = `${message.status || 'Reading'}${percent}`;
      }
    });
    const { data } = await worker.recognize(canvas);
    await worker.terminate();
    textArea.value = data.text.trim();
    copyTextButton.disabled = !textArea.value;
    progressEl.textContent = textArea.value ? `Found ${textArea.value.length.toLocaleString()} characters.` : 'No text was recognized. Try a tighter, higher-resolution crop.';
  } catch (error) {
    progressEl.textContent = `OCR failed: ${error.message}`;
  } finally {
    button.disabled = false;
  }
});

copyTextButton.addEventListener('click', async () => {
  await navigator.clipboard.writeText(textArea.value);
  copyTextButton.textContent = 'Copied!';
});

loadCapture().catch(error => { progressEl.textContent = error.message; });
