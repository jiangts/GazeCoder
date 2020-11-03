// if you checked "fancy-settings" in extensionizr.com, uncomment this lines

// var settings = new Store("settings", {
//     "sample_setting": "This is how you use Store.js to remember values"
// });


//example of using a message handler from the inject scripts
// chrome.extension.onMessage.addListener(
//   function(request, sender, sendResponse) {
//   	chrome.pageAction.show(sender.tab.id);
//     sendResponse();
//   });


// Called when the user clicks on the browser action.
chrome.browserAction.onClicked.addListener(async (tab) => {
  // No tabs or host permissions needed!
  const includeJS = file => new Promise(s => {
    chrome.tabs.executeScript({ file }, s)
  })
  const includeCSS = file => new Promise(s => {
    chrome.tabs.insertCSS({ file }, s)
  })

  const stylesheets = [
    "css/toastr.min.css",
    "css/index.css"
  ]
  const scripts = [
    "js/jquery-2.2.4.min.js",
    "js/toastr.min.js",
    "js/socket.io.js",
    "js/lodash.min.js",
    "src/inject/index.js"
  ]
  await Promise.all(stylesheets.map(includeCSS))
  for(let file of scripts) {
    // in order execution
    await includeJS(file)
  }

  // "content_scripts": [
  //   {
  //     "matches": [
  //       "<all_urls>"
  //     ],
  //     "css": [
  //       "css/toastr.min.css",
  //       "css/index.css"
  //     ],
  //     "js": [
  //       "js/jquery-2.2.4.min.js",
  //       "js/toastr.min.js",
  //       "js/socket.io.js",
  //       "src/inject/index.js"
  //     ]
  //   }
  // ]

});

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    console.log(sender.tab ?
      "from a content script:" + sender.tab.url :
      "from the extension");
    if (request.type == "resize") {
      chrome.windows.getCurrent(function(wind) {
        var maxWidth = window.screen.availWidth;
        var maxHeight = window.screen.availHeight;
        chrome.windows.update(wind.id, {
          left: 0,
          top: 0,
          width: request.data.w,
          height: maxHeight
        });
      });
    }
  });
