// 1) Override WebGL to preserve the drawing buffer
(function () {
  const orig = HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.getContext = function (type, attrs = {}) {
    if (type === 'webgl' || type === 'experimental-webgl') {
      attrs = { ...attrs, preserveDrawingBuffer: true };
    }
    return orig.call(this, type, attrs);
  };
})();


(function () {
       

  function getCanvasElement() {
    return (// id of the canvas can be change from site to site !!!
      document.querySelector('#defaultCanvas0') ||
      document.querySelector('canvas')
    );
  }

  // Video recording via MediaRecorder
  function startRecordingVideo(targetCanvas, duration = 5000, bitrate = 2_000_000) {
    const stream = targetCanvas.captureStream();
    const recorder = new MediaRecorder(stream, {
      mimeType: 'video/webm; codecs=vp9',
      videoBitsPerSecond: bitrate
    });
    const chunks = [];
    recorder.ondataavailable = e => chunks.push(e.data);
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'canvas_capture.webm';
      a.click();
      URL.revokeObjectURL(url);
    };
    recorder.start();
    console.log(`Recording video for ${duration}ms…`);
    setTimeout(() => recorder.stop(), duration);
  }

  
function exportPNGSequenceRAF(targetCanvas, duration = 5000, fps = 24) {
  const frames = [];
  const startTime = performance.now();
  const interval = 1000 / fps;
  let lastCapture = startTime;

  function capture(now) {
    if (now - startTime >= duration) {
      Promise.all(frames)
        .then(blobs => {
          const zip = new JSZip();
          blobs.forEach((blob, i) => {
            const name = `frame-${String(i).padStart(4,'0')}.png`;
            zip.file(name, blob);
          });
          return zip.generateAsync({ type: 'blob' });
        })
        .then(zipBlob => {
          const url = URL.createObjectURL(zipBlob);
          const a = document.createElement('a');
          a.href = url; a.download = 'frames.zip';
          a.click();
          URL.revokeObjectURL(url);
        })
        .catch(console.error);
      return;
    }
    if (now - lastCapture >= interval) {
      lastCapture = now;
      const p = createImageBitmap(targetCanvas)
        .then(bitmap => {
          const off = new OffscreenCanvas(targetCanvas.width, targetCanvas.height);
          off.getContext('2d').drawImage(bitmap, 0, 0);
          return off.convertToBlob({ type: 'image/png' });
        });
      frames.push(p);
    }
    requestAnimationFrame(capture);
  }

  console.log(`⌛ Starting PNG capture at (${fps})FPS via requestAnimationFrame`);
  requestAnimationFrame(capture);
}

  // old Main entry: wait for canvas then start capture
  function waitForCanvasAndStart(retries = 10) {
    const canvasElem = getCanvasElement();
    if (canvasElem) {
      console.log('Found canvas:', canvasElem);
      //startRecordingVideo(canvasElem);
      exportPNGSequenceRAF(canvasElem);
    } else if (retries > 0) {
      console.log('⌛ Waiting for canvas...');
      setTimeout(() => waitForCanvasAndStart(retries - 1), 400);
    } else {
      console.error('❌ No canvas found after waiting.');
    }
  }

  

  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  const canvas = getCanvasElement();
  if (!canvas) {
    console.error('No canvas found!');
    return;
  }
  else{
    console.log('Found canvas:', canvas);
  }

  switch (msg.action) {
    case 'capture_png_sequence':
      exportPNGSequenceRAF(canvas, msg.duration, msg.fps);
      break;

    case 'capture_webm_video':
      startRecordingVideo(canvas, msg.duration, msg.bitrate);
      break;

    default:
      console.warn('Unknown action:', msg.action);
  }
});
})();
