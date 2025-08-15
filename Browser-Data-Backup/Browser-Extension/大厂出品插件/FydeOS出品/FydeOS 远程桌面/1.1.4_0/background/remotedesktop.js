var isSupported = new Promise(
  function (resolve) {
    try {
      var port = chrome.runtime.connectNative('com.google.chrome.remote_assistance');
    } finally {}

    function onMessage() {
      port.onDisconnect.removeListener(onDisconnected);
      port.onMessage.removeListener(onMessage);
      port.disconnect();
      resolve(true);
    }

    function onDisconnected() {
      port.onDisconnect.removeListener(onDisconnected);
      port.onMessage.removeListener(onMessage);
      resolve(false);
    }

    port.onDisconnect.addListener(onDisconnected);
    port.onMessage.addListener(onMessage);
    port.postMessage({ type: 'hello' });
  }
);

var remoting = remoting || {};
remoting.settings = new remoting.Settings();
remoting.identity = new remoting.Identity();

chrome.runtime.onConnectExternal.addListener(function(port) {
  console.assert(port.name == "fydeosremoting");
  port.onMessage.addListener(function(msg) {
    if (msg.action === 'generateAccessCode') {
      remoting.port = port;
      isSupported.then((v) => {
        if (v) {
          remoting.onAccessCodeReceived = function (accessCode, expiresIn) {
            port.postMessage({ accessCode, expiresIn });
          };
          remoting.tryShare();
        } else {
          port.postMessage({ hostError: '不支持该浏览器' });
        }
      });
    } else if (msg.action === 'destroyAccessCode') {
      remoting.cancelShare(port);
      port.postMessage({ msg: 'destroying' });
    }

    if (msg.joke == "Knock knock")
      port.postMessage({question: "Who's there?"});
    else if (msg.answer == "Madame")
      port.postMessage({question: "Madame who?"});
    else if (msg.answer == "Madame... Bovary")
      port.postMessage({question: "I don't get it."});
  });
});

chrome.runtime.onMessageExternal.addListener(
  function (request, sender, sendResponse) {
    if (request.action === 'ping') {
      remoting.tabId = remoting.tabId || sender.tab.id;
      sendResponse({ msg: 'pong' });
    }
  }
);

remoting.sendMessageToClient = function (msgObj) {
  remoting.port.postMessage(msgObj, function () { });
}
