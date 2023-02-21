const WEB_STORE_RESULT_ENUM = [{
  "name": "",
  "description": "Empty string, used to indicate success by beginInstallWithManifest3"
}, {
  "name": "success",
  "description": "Installation was successful"
}, {
  "name": "user_gesture_required",
  "description": "Function was called without a user gesture"
}, {
  "name": "unknown_error",
  "description": "An unknown error occured"
}, {
  "name": "feature_disabled",
  "description": "The requested feature is not available"
}, {
  "name": "unsupported_extension_type",
  "description": "The requested feature is not availabe for this type of extension"
}, {
  "name": "missing_dependencies",
  "description": "There were unsatisfied dependencies, such as shared modules"
}, {
  "name": "install_error",
  "description": "An error occured during installation"
}, {
  "name": "user_cancelled",
  "description": "The user canceled the operation"
}, {
  "name": "invalid_id",
  "description": "An invalid Chrome Web Store item ID was provided"
}, {
  "name": "blacklisted",
  "description": "The given extension is blacklisted"
}, {
  "name": "blocked_by_policy",
  "description": "The given extension is blocked by management policy"
}, {
  "name": "install_in_progress",
  "description": "An installation of the same extension is already in progress"
}, {
  "name": "launch_in_progress",
  "description": "A launch of the same extension is already in progress"
}, {
  "name": "manifest_error",
  "description": "Parsing of the extension manifest failed"
}, {
  "name": "icon_error",
  "description": "Failed to retrieve the extension's icon from the Web Store, or the icon was invalid"
}, {
  "name": "invalid_icon_url",
  "description": "An invalid icon URL was provided"
}, {
  "name": "already_installed",
  "description": "The extension is already installed"
}, {
  "name": "blocked_for_child_account",
  "description": "The user is signed in to a child account, and not allowed to perform the operation"
}];

const SuccessIndexList = [0,1,12,13,17];

function installCrx(appId, manifest, iconUrl, cb = null) {
  chrome.webstorePrivate.beginInstallWithManifest3({
    id: appId,
    manifest: handleManifest(manifest),
    iconUrl: iconUrl,
  }, result => {
    handleStoreApiReturn(result, msg => {
      chrome.webstorePrivate.completeInstall(appId, result => {
        handleStoreApiReturn(result, msg => {
          typeof cb === 'function' && cb(null, true);
        }, err => {
          typeof cb === 'function' && cb(err, null);
        });
      });
    }, err => {
      typeof cb === 'function' && cb(err, null);
    });
  });
}

function handleManifest(manifest) {
  let local = chrome.i18n.getUILanguage();
  try {
    if (typeof manifest === 'string') manifest = JSON.parse(manifest);
  } catch(e) { }
  ['name', 'short_name', 'description'].forEach(key => {
    let tmp = '';
    const v = manifest[key];
    if (v && typeof v === 'object') {
      if (v.value) { tmp = v.value; }
      if (v._locales && v._locales[local]) { tmp = v._locales[local]; }
      manifest[key] = tmp;
    }
  });
  return JSON.stringify(manifest);
}

function handleStoreApiReturn(result, successCB, errCB) {
  if (!result) result = '';
  for (let i = 0; i < WEB_STORE_RESULT_ENUM.length; i++) {
    if (result === WEB_STORE_RESULT_ENUM[i].name) {
      if (i in SuccessIndexList)
        return successCB(result)
      else
        return errCB(new Error(WEB_STORE_RESULT_ENUM[i].description));
    }
  }
  return errCB(new Error('unknow error'))
}

function replyOK(sendResponse, data = '') {
  sendResponse({ state:'OK', data });
}

function replyErr(sendResponse, err) {
  sendResponse({ state:'ERROR', error: err.message });
}

function isApk(url) {
  return url.split('.').pop() === 'apk';
}

function postData(url, data) {
  return fetch(url, {
    method: 'POST',
    mode: 'no-cors',
    cache: 'no-cache',
    credentials: 'include',
    headers: {
      // 'Content-Type': 'multipart/form-data',
    },
    redirect: 'follow',
    referrer: 'no-referrer',
    body: data,
  })
  .then(response => {
    return response;
  });
}

async function getData(url, params) {
  const query = Object.keys(params)
    .map(k => encodeURIComponent(k) + '=' + encodeURIComponent(params[k]))
    .join('&');
  if (query) url += `?${query}`;
  try {
    const response = await axios.get(url);
    return response;
  } catch (err) {
    throw err;
  }
}

async function getDeviceArch() {
  try {
    const data = await execForResult(`uname -m`);
    if (data.trim() === 'x86_64') return 'x86_64';
    return 'arm';
  } catch (err) {
    return '';
  }
}

function execForResult(cmd) {
  return new Promise(function(resolve, reject) {
    chrome.shellClient.execSync(cmd, function(obj) {
      console.log('result', cmd, obj);
      if (obj.code !== 0)
        reject(new Error(obj.result));
      else
        resolve(obj.result);
    });
  });
}
