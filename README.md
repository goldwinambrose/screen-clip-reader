# Screen Clip Reader

A privacy-friendly Chrome extension that lets you select anything visible in a browser tab, copy the crop as an image, or extract and copy its text with local OCR. It works on images, paused video frames (including YouTube), canvas content, PDFs shown in a webpage, and ordinary sites.

## Features

- Draw a crop box over the current page
- Copy the crop directly to the clipboard as a PNG
- Download the crop as a PNG
- Extract English text locally with Tesseract.js—no screenshot upload
- Copy visible YouTube captions, or the full transcript when YouTube's transcript panel is already open
- Escape cancels selection

## Install from source

1. Download or clone this repository.
2. Open `chrome://extensions`.
3. Enable **Developer mode**.
4. Click **Load unpacked** and select this repository folder.

## Use

1. Open any normal webpage. Pause a video first if you want a specific frame.
2. Click the extension, then **Select an area**.
3. Drag around the content you want.
4. In the result tab, copy/download the image or select **Read text (OCR)**.

For YouTube captions, turn captions on or open YouTube's **Show transcript** panel, then choose **Copy YouTube captions**.

## Privacy and limitations

All OCR runs on-device. Captures are stored only in Chrome's local extension storage and are replaced by the next capture. The extension cannot operate on protected Chrome pages such as `chrome://extensions`, and DRM-protected video may appear black in screenshots. OCR accuracy depends on resolution, contrast, font, and language; version 1.0 includes English data.

Respect copyright, privacy, and website terms when copying content. This tool does not bypass DRM or access controls.

## Third-party software

OCR is powered by [Tesseract.js](https://github.com/naptha/tesseract.js), distributed under the Apache-2.0 license. See `THIRD_PARTY_NOTICES.md`.

## License

MIT—see [LICENSE](LICENSE).
