(function() {
  var getClassInfo, getItem, getStorage, loadModifiers, removeItem, setItem;

  getItem = function(key) {
    return getStorage().getItem(key);
  };

  setItem = function(key, map) {
    return getStorage().setItem(key, map);
  };

  removeItem = function(key) {
    return getStorage().removeItem(key);
  };

  getStorage = function() {
    return window.localStorage;
  };

  loadModifiers = function(json) {
    var showModifiers, showNone, showPrivate, showProtected, showPublic;
    showPublic = localStorage["showPublic"];
    showProtected = localStorage["showProtected"];
    showNone = localStorage["showNone"];
    showPrivate = localStorage["showPrivate"];
    if (showPublic === undefined || showProtected === undefined || showNone === undefined || showPrivate === undefined) {
      showPublic = "true";
      showProtected = showNone = showPrivate = "false";
    }
    showModifiers = json["showModifiers"] = {};
    showModifiers["showPublic"] = showPublic;
    showModifiers["showProtected"] = showProtected;
    showModifiers["showNone"] = showNone;
    return showModifiers["showPrivate"] = showPrivate;
  };

  getClassInfo = function(url, callback) {
    var xhr;
    xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
      var json;
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          json = JSON.parse(xhr.responseText);
          loadModifiers(json);
          return callback(json);
        } else {
          return callback("false");
        }
      }
    };
    xhr.open("GET", "http://japarser.appspot.com/src?url=" + url, true);
    xhr.send(null);
    return xhr;
  };

  chrome.extension.onRequest.addListener(function(request, sender, callback) {
    var json;
    switch (request.action) {
      case "isRunning":
        if (getItem("isRunning") === "true") {
          json = {};
          loadModifiers(json);
          return callback(json);
        } else {
          return callback("false");
        }
        break;
      case "getClassInfo":
        if (getItem("isRunning") === "true") {
          return getClassInfo(sender.tab.url, callback);
        } else {
          return callback("false");
        }
    }
  });

  chrome.browserAction.onClicked.addListener(function(tab) {
    if (getItem("isRunning") !== "true") {
      setItem("isRunning", "true");
      chrome.browserAction.setBadgeText({
        text: "on"
      });
    } else {
      setItem("isRunning", "false");
      chrome.browserAction.setBadgeText({
        text: "off"
      });
    }
    return chrome.tabs.executeScript(tab.id, {
      code: "location.reload();"
    });
  });

  (function() {
    if (getItem("isRunning") !== "true") {
      return chrome.browserAction.setBadgeText({
        text: "off"
      });
    } else {
      return chrome.browserAction.setBadgeText({
        text: "on"
      });
    }
  })();

}).call(this);
