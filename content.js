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
  const FPS = 30;            
  const DURATION = 32000;     
  const PNG_FPS = 30;        

  function getCanvasElement() {
    return (// id of the canvas can be change from site to site !!!
      document.querySelector('#defaultCanvas0') ||
      document.querySelector('canvas')
    );
  }

  // Video recording via MediaRecorder
  function startRecordingVideo(targetCanvas) {
    const stream = targetCanvas.captureStream(FPS);
    const recorder = new MediaRecorder(stream, {
      mimeType: 'video/webm; codecs=vp9',
      videoBitsPerSecond: 5_000_000
    });
    const chunks = [];

    recorder.ondataavailable = (e) => chunks.push(e.data);
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'canvas_capture.webm';
      a.click();
      URL.revokeObjectURL(url);
    };

    recorder.start();
    console.log(`Recording video at ${FPS} FPS for ${DURATION}ms…`);

    setTimeout(() => {
      recorder.stop();
      console.log('Video recording stopped. Downloading…');
    }, DURATION);
  }

  
function exportPNGSequenceRAF(targetCanvas) {
  const frames = [];
  const startTime = performance.now();
  const interval = 1000 / PNG_FPS;
  let lastCapture = startTime;

  function capture(now) {
    if (now - startTime >= DURATION) {
      // build the zip from the blob
      return Promise.all(frames)
        .then((blobs) => {
          console.log(`Captured ${blobs.length} frames. Building ZIP…`);
          const zip = new JSZip();
          blobs.forEach((blob, i) => {
            const filename = `frame-${String(i).padStart(4, '0')}.png`;
            zip.file(filename, blob);
          });
          return zip.generateAsync({ type: 'blob' });
        })
        .then((zipBlob) => {
          const url = URL.createObjectURL(zipBlob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'frames.zip';
          a.click();
          URL.revokeObjectURL(url);
          console.log('Amına kodumun frames.zip i sonunda indirildi.');
        })
        .catch((err) => console.error('⚠️ Error in ZIP creation/download:', err));
    }

    if (now - lastCapture >= interval) {
      lastCapture = now;
      // queue this frame
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

  console.log(`⌛ Starting PNG capture at (${PNG_FPS})FPS via requestAnimationFrame`);
  requestAnimationFrame(capture);
}

  // Main entry: wait for canvas then start capture
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

  waitForCanvasAndStart();
})();
