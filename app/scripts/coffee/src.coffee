(->
  execute = =>
    chrome.extension.sendRequest
      action: "getClassInfo"
    , (response) ->
      return  if response is null or response is "" or response is "false"
      
      (->
        _document = document
        classInfo = response
        classView = _document.createElement("div")
        classView.id = "classView"
        classView.setAttribute "style", "z-index: 100; top:10px; right:10px; opacity: 0.8; background-color:#fff; overflow: auto; max-height: 800px; max-width: 960px; position:fixed;"
        classView.innerHTML = new java2yuml.Japarser().generateImage(classInfo, false, "dir:lr")
        _document.body.appendChild classView  unless classInfo.name is ""
      )()

  clearClass = ->
    cv = document.getElementById("classView")
    cv.parentElement.removeChild cv  if cv

  pjaxClickHandler = (event) =>
    if event.target.nodeName is "A" or event.target.nodeName is "SPAN"
      clearClass()
      execute()  if /\.java/.test(event.target.innerText)

  window.addEventListener "click", (event) ->
    pjaxClickHandler event  if window.location.hostname is "github.com"

  document.addEventListener "click", (event) ->
    pjaxClickHandler event  if window.location.hostname is "bitbucket.org"

  execute()
)()