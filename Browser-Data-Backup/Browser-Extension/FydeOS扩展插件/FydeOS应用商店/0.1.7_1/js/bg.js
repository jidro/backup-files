chrome.app.runtime.onLaunched.addListener((request) => {
  chrome.app.window.create('../index.html', {
    outerBounds: {
      width: 1080,
      height: 762,
    },
  }, (createdWindow) => {
    console.log('App started!');
    createdWindow.contentWindow.injectUrl = () => {
      if (request.id && request.id === 'init_type' && request.url) {
        return request.url;
      }
      return 'https://store.fydeos.com';
    };
  });
});
