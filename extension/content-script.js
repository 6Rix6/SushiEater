// preserveDrawingBuffer を有効化
const preserveScript = document.createElement('script');
preserveScript.src = chrome.runtime.getURL('early-inject.js');
preserveScript.type = 'text/javascript';
(document.head || document.documentElement).prepend(preserveScript);

const cheatState = {
  isEnabled: true,
  isVisible: false,
  isAuto: false,
  isKeyDisable: false,
  isKeyFake: false,
}

chrome.storage.local.set({isInjected:false});
chrome.storage.local.set({isEnabled:true});
let isInjected = false;

const updateCheatState = async () =>{
  await chrome.storage.local.get(
    {
      isVisible: false,
      isAuto: false,
      isKeyDisable: false,
      isKeyFake: false,
    },
    (result)=>{
      cheatState.isVisible = result.isVisible;
      cheatState.isAuto = result.isAuto;
      cheatState.isKeyDisable = result.isKeyDisable;
      cheatState.isKeyFake = result.isKeyFake;
    }
  )
  console.log("cheatState Updated. : ",cheatState);
}

const injectScript = async() => {
  if (document.getElementById("cheat-main-script")) return; // すでに読み込んでいたら無視

  const script = document.createElement("script");
  script.src = chrome.runtime.getURL("main.js");
  script.id = "cheat-main-script";
  document.body.appendChild(script);
  console.log("Cheat is ready.");
  await updateCheatState();
  isInjected = true;
  chrome.storage.local.set({isInjected:isInjected});
  setTimeout(async() => {
    window.postMessage({type: "SET_CHEAT_STATE", state:cheatState}, "*");
  }, 1000);
}

window.onload = async (e) => {
  updateCheatState();
}

// tesseract.min.js 読み込み → その後 main.js を読み込む
const tesseractScript = document.createElement('script');
tesseractScript.src = chrome.runtime.getURL('tesseract.min.js');
tesseractScript.onload = async () => {
   window.addEventListener("keydown", async(e) => {
    if (e.key === "Shift") {
      injectScript();
  }
});
};
document.body.appendChild(tesseractScript);

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // ページ側に window.postMessage で渡す
  console.log(message);
  if(message.type === "SET_CHEAT_STATE")window.postMessage({ type: "SET_CHEAT_STATE", state: message.state }, "*");
  if(message.type === "CHEAT_ACTIVATE")injectScript();
});
