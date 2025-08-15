const COMMAND_INSTALL = 'install';
const DIR_FROM = 'from_page';
const DIR_TO = 'to_page';
const FYDEOS_SYSTEM_ID = 'mofiofjpikncjaigmdlblhojbnkabako';
const STORE_ORIGIN = 'https://store.fydeos.com';
const SET_STORE_URL = 'set_store_url';
const REMOVE_STORE_URL = 'remove_store_url';
const OPEN_URL = 'open_url';
const GET_ARC_LIST_VERSION = 'get_arc_list_version';
const ARC_INSTALL_API = 'http://100.115.92.2:10038';
const STATE_PROGRESS = 'PROGRESS';
let port = null;
let childWindow = null;

function sendInitialMessage(e) {
  e.target.contentWindow.postMessage("initial message", STORE_ORIGIN);
}

window.onload = () => {
  document.getElementById('store').src = injectUrl();
  port = chrome.runtime.connect(FYDEOS_SYSTEM_ID);
  document.getElementById('store').addEventListener('loadstop', sendInitialMessage);

  window.addEventListener("message", function({source, data, origin}) {
    if (origin != STORE_ORIGIN || !data.type || data.type !== DIR_FROM)
      return;
    if (!childWindow) {
      childWindow = source;
      port.onMessage.addListener(msg => {
        msg.type = DIR_TO;
        childWindow && childWindow.postMessage(msg, STORE_ORIGIN);
      });
    }

    function sendResponse(obj) {
      let id = data.id;
      if (obj.state === STATE_PROGRESS) {
        id = 'progress_id';
      }

      source.postMessage({
        id,
        data: obj,
        type: DIR_TO,
      }, STORE_ORIGIN);
    }

    if (data.command) {
      switch (data.command) {
        case OPEN_URL:
          if (data.params && data.params.url) {
            setTimeout(() => {
              chrome.browser.openTab({ url: data.params.url });
            }, 300);
          }
          break;
        case COMMAND_INSTALL:
          if (data.params && data.params.appId && data.params.downloadUrl) {
            if (isApk(data.params.downloadUrl)) {
              installAndriod(sendResponse, data.params);
            } else if (data.params.manifest && data.params.iconUrl) {
              installChromeApp(sendResponse, data.params);
            }
          }
          break;
        case GET_ARC_LIST_VERSION:
          if (data.params && data.params.length) {
            getArcListVersion(sendResponse, data.params);
          }
          break;
        default:
          port.postMessage(data);
          break;
      }
    }
  }, false);
};

async function installAndriod(sendResponse, params) {
  const arch = await getDeviceArch();
  const { downloadUrl, downloadUrlx86, appId, noProgress} = params;
  let url = downloadUrl;
  if (arch === 'x86_64' && downloadUrlx86) url = downloadUrlx86;
  const response = await axios.get(url, {
    responseType: "blob",
    onDownloadProgress: progressEvent => {
      const progress = progressEvent.loaded / progressEvent.total * 100;
      if (!noProgress) {
        sendResponse({ state: STATE_PROGRESS, data: { progress, appId } });
      }
    },
  });
  // APK download complete
  let formData = new FormData();
  formData.append('file', response.data);
  postData(`${ARC_INSTALL_API}/i`, formData)
    .then(data => {
      replyOK(sendResponse, { msg: 'install complete' });
    })
    .catch(err => {
      console.log(err);
      replyErr(sendResponse, err);
    });
}

function installChromeApp(sendResponse, params) {
  port.postMessage({
    command: SET_STORE_URL,
    params: {
      url: `${STORE_ORIGIN}/download/%s/fydeos_packaged_app.crx`,
    },
  });
  installCrx(params.appId, params.manifest, params.iconUrl, (err, result) => {
    port.postMessage({
      command: REMOVE_STORE_URL,
    });
    if (err) return replyErr(sendResponse, err);
    replyOK(sendResponse, result);
  });
}

async function getArcListVersion(sendResponse, params) {
  const promises = [];
  for (let i = 0; i < params.length; i++) {
    const { packageName } = params[i];
    const func = getData(`${ARC_INSTALL_API}/v`, { packageName } );
    promises.push(func);
  }
  try {
    const results = await Promise.all(promises);
    for (let i = 0; i < results.length; i++) {
      const versionName = results[i].data.split('"versionName": "')[1].split('"')[0];
      params[i].version = versionName;
    }
    const ret = params;
    replyOK(sendResponse, ret);
  } catch (err) {
    console.log(err);
    replyErr(sendResponse, err);
  }
}

window.onclose = () => {
  if (port) port.disconnect();
};
