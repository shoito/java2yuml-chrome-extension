getItem = (key) ->
  getStorage().getItem key

setItem = (key, map) ->
  getStorage().setItem key, map

removeItem = (key) ->
  getStorage().removeItem key

getStorage = ->
  window.localStorage

loadModifiers = (json) ->
  showPublic = localStorage["showPublic"]
  showProtected = localStorage["showProtected"]
  showNone = localStorage["showNone"]
  showPrivate = localStorage["showPrivate"]
  if showPublic is `undefined` or showProtected is `undefined` or showNone is `undefined` or showPrivate is `undefined`
    showPublic = "true"
    showProtected = showNone = showPrivate = "false"
  showModifiers = json["showModifiers"] = {}
  showModifiers["showPublic"] = showPublic
  showModifiers["showProtected"] = showProtected
  showModifiers["showNone"] = showNone
  showModifiers["showPrivate"] = showPrivate

getClassInfo = (url, callback) ->
  xhr = new XMLHttpRequest()
  xhr.onreadystatechange = ->
    if xhr.readyState is 4
      if xhr.status is 200
        json = JSON.parse(xhr.responseText)
        loadModifiers json
        callback json
      else
        callback "false"

  xhr.open "GET", "http://japarser.appspot.com/src?url=" + url, true
  
  #xhr.open('GET', 'http://localhost:8888/src/?url=' + url, true);
  xhr.send null
  xhr

chrome.extension.onRequest.addListener (request, sender, callback) ->
  switch request.action
    when "isRunning"
      if getItem("isRunning") is "true"
        json = {}
        loadModifiers json
        callback json
      else
        callback "false"
    when "getClassInfo"
      if getItem("isRunning") is "true"
        getClassInfo sender.tab.url, callback
      else
        callback "false"

chrome.browserAction.onClicked.addListener (tab) ->
  if getItem("isRunning") isnt "true"
    setItem "isRunning", "true"
    chrome.browserAction.setBadgeText text: "on"
  else
    setItem "isRunning", "false"
    chrome.browserAction.setBadgeText text: "off"
  chrome.tabs.executeScript tab.id,
    code: "location.reload();"


(->
  if getItem("isRunning") isnt "true"
    chrome.browserAction.setBadgeText text: "off"
  else
    chrome.browserAction.setBadgeText text: "on"
)()