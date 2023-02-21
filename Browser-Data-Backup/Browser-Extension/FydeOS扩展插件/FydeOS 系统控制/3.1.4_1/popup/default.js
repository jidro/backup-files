window.onload = function() {
  const manifest = chrome.runtime.getManifest();
  const { version } = manifest;
  const title = chrome.i18n.getMessage("extName") + ` ${version}`;
  document.getElementById('popup-text').innerHTML = title;
};
