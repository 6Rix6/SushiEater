// preserveDrawingBuffer を有効化
const preserveScript = document.createElement('script');
preserveScript.src = chrome.runtime.getURL('early-inject.js');
preserveScript.type = 'text/javascript';
(document.head || document.documentElement).prepend(preserveScript);

// tesseract.min.js 読み込み → その後 main.js を読み込む
const tesseractScript = document.createElement('script');
tesseractScript.src = chrome.runtime.getURL('tesseract.min.js');
tesseractScript.onload = () => {
   window.addEventListener("keydown", (e) => {
    if (e.key === "Shift") {
    // すでに読み込んでいたら無視（連打対策）
    if (document.getElementById("cheat-main-script")) return;

    const script = document.createElement("script");
    script.src = chrome.runtime.getURL("main.js");
    script.id = "cheat-main-script";
    document.body.appendChild(script);
    console.log("🎮 Cheat activated (main.js loaded)!");
  }
});
};
document.body.appendChild(tesseractScript);

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // ページ側に window.postMessage で渡す
  window.postMessage({ type: "TOGGLE_CHEAT", state: message.state }, "*");
});