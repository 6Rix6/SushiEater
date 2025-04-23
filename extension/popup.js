const toggle = document.getElementById("toggle");
const visible = document.getElementById("visible");
const auto = document.getElementById("auto");
const keyDisable = document.getElementById("keyDisable");
const keyFake = document.getElementById("keyFake");
const icon = document.getElementById("icon");

let isInjected = false;

const cheatState = {
  isEnabled: true,
  isVisible: false,
  isAuto: false,
  isKeyDisable: false,
  isKeyFake: false,
}

const sendCheatState = async() => {
  chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
    chrome.tabs.sendMessage(tab.id, { type: "SET_CHEAT_STATE", state: cheatState });
  });
}

const toggleIsEnable = () => {
  if(!isInjected){
    isInjected = true;
    setToggleButton(true);
  }else{
    cheatState.isEnabled = !cheatState.isEnabled;
    chrome.storage.local.set({isEnabled:cheatState.isEnabled});
    console.log(cheatState.isEnabled);
    setToggleButton(cheatState.isEnabled);
    console.log("スイッチ用toggle : ",cheatState.isEnabled);
  }
}

const setToggleButton = (isEnabled) => {
  console.log("setToggleButton called. isEnabled: ",isEnabled);
  if(isEnabled){
    icon.src = "image/SushiNinja_nobg.png";
    toggle.innerText = "無効化";
    toggle.style.backgroundColor = "#f94144";//赤色
  }else{
    toggle.innerText = "有効化";
    icon.src = "image/Sushi_nobg.png";
    toggle.style.backgroundColor = "#c2c0c0";//灰色
  }
}

const getCheatState = async() => {
  const defaultState = {
    isEnabled: true,
    isVisible: false,
    isAuto: false,
    isKeyDisable: false,
    isKeyFake: false,
  };

  const result = await new Promise((resolve) => {
    chrome.storage.local.get(defaultState, resolve);
  });

  visible.checked = result.isVisible;
  auto.checked = result.isAuto;
  keyDisable.checked = result.isKeyDisable;
  keyFake.checked = result.isKeyFake;

  cheatState.isEnabled = result.isEnabled;
  cheatState.isVisible = result.isVisible;
  cheatState.isAuto = result.isAuto;
  cheatState.isKeyDisable = result.isKeyDisable;
  cheatState.isKeyFake = result.isKeyFake;
}

window.onload = async (e) => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const url = tabs[0].url;
    const isSushida = url.includes("sushida.net");

    toggle.disabled = !isSushida;

    if (!isSushida) {
      toggle.innerText = "このサイトでは\n有効化できません";
      toggle.style.opacity = 0.5;
      toggle.style.cursor = "not-allowed";
    }

    document.querySelectorAll('input[type="checkbox"]').forEach(cb => {
      cb.disabled = !isSushida;
    });
  });

  await getCheatState();
  const va =  await chrome.storage.local.get("isInjected");
  isInjected = va.isInjected;
  console.log(cheatState.isEnabled);
  if(va.isInjected) setToggleButton(cheatState.isEnabled);
};

toggle.addEventListener("click", async () => {
  if(!isInjected){
    chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
      chrome.tabs.sendMessage(tab.id, { type: "CHEAT_ACTIVATE" });
    });
  }
  toggleIsEnable();
  if(isInjected)sendCheatState();
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