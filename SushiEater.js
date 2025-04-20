//すべてのgetContextにpreserveDrawingBuffer = trueを強制
//ただしスクリプトが読み込まれる前（つまりめっちゃ早く）に実行しなければいけない
var getContext = HTMLCanvasElement.prototype.getContext;
HTMLCanvasElement.prototype.getContext = function(){
  if( arguments[ 1 ] ) arguments[ 1 ].preserveDrawingBuffer = true;
  var context = getContext.apply( this, arguments );
  return context;
}


//本体
const script = document.createElement('script');
script.src =
  'https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.min.js'
script.onload = async () => {
  function sendKey(key) {
    const event = new KeyboardEvent('keypress', { charCode: key.charCodeAt() })
    document.dispatchEvent(event);
  }
  async function sendKeys(keys, { inputDelay = DELAY_KEYINPUT } = {}) {
    return new Promise(resolve => {
      keys.split('').forEach((c, i) => {
        setTimeout(() => {
          sendKey(c);
          if (i + 1 === lastParsed.length) resolve(keys);
        }, inputDelay * i)
      })
    })
  }

  const DELAY_KEYINPUT = 10;
  const INTERVAL_OCR = 200;
  const WIDTH_ROMAJI_AREA = 330;
  const HEIGHT_ROMAJI_AREA = 25;
  const X_ROMAJI_AREA = 80;
  const Y_ROMAJI_AREA = 230;
  const worker = await Tesseract.createWorker("eng");
  const canvas = document.querySelector('canvas');
  const gl = canvas.getContext('webgl2');
  const bufferCanvas = document.createElement('canvas');
  const bufferContext = bufferCanvas.getContext('2d');
  const image = document.createElement('img');
  let updating = false;
  let lastParsed = null;

  bufferCanvas.width = WIDTH_ROMAJI_AREA;
  bufferCanvas.height = HEIGHT_ROMAJI_AREA;

  var executing = true;


  const switchExecution = (e) => {
    if (e.key === "Shift") {
      executing = executing == false ? true : false;
    }  
    return false;
  } 

  window.addEventListener("keydown",switchExecution)

  setInterval(() => {
    if (updating || !executing) return;
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
    console.log("recognizing...")
    worker
      .recognize(bufferCanvas)
      .then(r => {
        const matched = r.data.text.match(/([a-z-,!?]{2,})/)
        if (!matched) {
          console.warn(`recognition failed: ${r.text}`, r)
          return
        }
        // ガード
        if (matched[1] === lastParsed) return;
        updating = true;
        lastParsed = matched[1];
        sendKeys(lastParsed)
          .then(inputted => console.log(`completed: ${inputted}`))
          .finally(() => {
            updating = false
          })
      })
      .catch(console.error)
  }, INTERVAL_OCR);
  document.querySelector("#game").appendChild(bufferCanvas);
}
document.body.appendChild(script);

