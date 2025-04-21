let cheatState = {
  isAuto: false,
  isVisible: false,
  setIsAuto: function(state) {
    this.isAuto = state;
    console.log("auto mode : ", state);
  },
  setIsVisible: function(state) {
    this.isVisible = state;
    console.log("text visible :")
  }
};

window.addEventListener("message", (event) => {
  if (event.source !== window) return; // 自分からの message 以外は無視

  if (event.data.type === "TOGGLE_CHEAT") {
    if (cheatState) {
      cheatState.setIsAuto(event.data.state);
    } else {
      console.warn("cheatState is not difined");
    }
  }

  if (event.data.type === "INITIAL_STATE") {
    console.log("catch: ",event.data.type);
    document.getElementById("bufferCanvas").style.display = event.data.state?"display":"none";
  }
});


(async () => {
  function waitForCanvas() {
    return new Promise(resolve => {
      const check = () => {
        const canvas = document.querySelector('canvas');
        if (canvas) resolve(canvas);
        else setTimeout(check, 100);
      };
      check();
    });
  }

  function sendKey(key) {
    const event = new KeyboardEvent('keypress', { charCode: key.charCodeAt() });
    document.dispatchEvent(event);
  }

  async function sendKeys(keys, { inputDelay = DELAY_KEYINPUT } = {}) {
    return new Promise(resolve => {
      keys.split('').forEach((c, i) => {
        setTimeout(() => {
          sendKey(c);
          if (i + 1 === lastParsed.length) resolve(keys);
        }, inputDelay * i);
      });
    });
  }

  const DELAY_KEYINPUT = 10;
  const INTERVAL_OCR = 200;
  const WIDTH_ROMAJI_AREA = 330;
  const HEIGHT_ROMAJI_AREA = 25;
  const X_ROMAJI_AREA = 80;
  const Y_ROMAJI_AREA = 230;

  const bufferCanvas = document.createElement('canvas');
  const bufferContext = bufferCanvas.getContext('2d');
  bufferCanvas.id = "bufferCanvas";
  bufferCanvas.style.display = cheatState.isVisible?"block":"none";
  bufferCanvas.width = WIDTH_ROMAJI_AREA;
  bufferCanvas.height = HEIGHT_ROMAJI_AREA;

  let executing = true;
  let updating = false;
  let lastParsed = null;

  window.addEventListener("keydown", (e) => {
    if (e.key === " ") {
        executing = true;
    }
    e.stopImmediatePropagation();
    e.preventDefault();//キー入力を無効化
  });

  const canvas = await waitForCanvas();
  const gl = canvas.getContext('webgl2');
  console.log(gl);

  console.log(Tesseract);
  const worker = await Tesseract.createWorker("eng");

  setInterval(() => {
    if (updating || !executing) return;
      executing = false;

    bufferContext.drawImage(
      gl.canvas,
      X_ROMAJI_AREA,
      Y_ROMAJI_AREA,
      WIDTH_ROMAJI_AREA,
      HEIGHT_ROMAJI_AREA,
      0,
      0,
      WIDTH_ROMAJI_AREA,
      HEIGHT_ROMAJI_AREA
    );

    worker.recognize(bufferCanvas)
      .then(r => {
        const matched = r.data.text.match(/([a-z-,!?]{2,})/);
        if (!matched || matched[1] === lastParsed) return;

        updating = true;
        lastParsed = matched[1];
        sendKeys(lastParsed)
          .then(inputted => console.log(`completed: ${inputted}`))
          .finally(() => { updating = false; });
      })
      .catch(console.error);
  }, INTERVAL_OCR);
  // if(!window.isVisible){
  //   bufferCanvas.style.display = "none";
  // }
  document.querySelector("#game").appendChild(bufferCanvas);
})();
