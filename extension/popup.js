let isEnabled = false;
const toggle = document.getElementById("toggle");
const visible = document.getElementById("visible");
const auto = document.getElementById("auto");
const keyDisable = document.getElementById("keyDisable");
const keyFake = document.getElementById("keyFake");

const cheatState = {
  isVisible: false,
  isAuto: false,
  isKeyDisable: false,
  isKeyFake: false,
}


window.onload = async (e) => {
  fetchCheatScript();
  chrome.storage.local.get(
    {
      isVisible: false,
      isAuto: false,
      isKeyDisable: false,
      isKeyFake: false,
    },
    (result)=>{
      visible.checked = result.isVisible;
      auto.checked = result.isAuto;
      keyDisable.checked = result.isKeyDisable;
      keyFake.checked = result.isKeyFake;
      cheatState.isVisible = result.isVisible;
      cheatState.isAuto = result.isAuto;
      cheatState.isKeyDisable = result.isKeyDisable;
      cheatState.isKeyFake = result.isKeyFake;
    }
  )
};

const sendCheatState = async() => {
  chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
    chrome.tabs.sendMessage(tab.id, { type: "SET_CHEAT_STATE", state: cheatState });
  });
}

const fetchCheatScript = async() => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true }); 

  await chrome.scripting.executeScript({
    target: { tabId: tab.id },
      func: function(){
        const bufferCanvas = document.getElementById("bufferCanvas");
        const isEnabled = !!bufferCanvas;　//buffercanvasが存在するかどうかでisEnabledを切り替え(!!って書けるんや...)
      }
  });
}

toggle.addEventListener("click", async () => {
  //    ↓↓↓↓↓  chrome.tabs.queryは配列を返すのでその0番目を"tab"に代入している(知らんかった～)
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true }); 
  if (!tab) return;

  // if (!isEnabled) {
  //   // main.js を注入
  //   await chrome.scripting.executeScript({
  //       target: { tabId: tab.id },
  //       func: function(){
  //           const script = document.createElement("script");
  //           script.src = chrome.runtime.getURL("main.js");
  //           script.id = "cheat-main-script";
  //           document.body.appendChild(script);
  //           console.log("Cheat activated.");
  //       }
  //   });
  //   isEnabled = true;
  //   toggle.innerText = "無効化";
  // } else {
  //   // 再読み込みでリセット（無効化）
  //   await chrome.scripting.executeScript({
  //     target: { tabId: tab.id },
  //     func: () => {
  //       location.reload(); // 手軽に元に戻す
  //     },
  //   });
  //   isEnabled = false;
  //   toggle.innerText = "有効化";
  // }
});

auto.addEventListener('click', async ()=>{
  cheatState.isAuto = auto.checked;
  chrome.storage.local.set({isAuto:auto.checked});
  sendCheatState();
});

visible.addEventListener('click', async ()=>{
  cheatState.isVisible = visible.checked;
  chrome.storage.local.set({isVisible:visible.checked});
  sendCheatState();
});

keyDisable.addEventListener('click', async () => {
  cheatState.isKeyDisable = keyDisable.checked;
  chrome.storage.local.set({isKeyDisable:keyDisable.checked});
  sendCheatState();
});

keyFake.addEventListener('click', async () => {
  cheatState.isKeyFake = keyFake.checked;
  chrome.storage.local.set({isKeyFake:keyFake.checked});
  sendCheatState();
});