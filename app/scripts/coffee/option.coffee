class Options
  saveOptions: =>
    @saveToLocalStorage()
    status = document.getElementById("status")
    status.innerHTML = "Options Saved."
    setTimeout (->
      status.innerHTML = ""
    ), 750

  saveToLocalStorage: =>
    localStorage["showPublic"] = document.getElementById("public").checked + ""
    localStorage["showProtected"] = document.getElementById("protected").checked + ""
    localStorage["showNone"] = document.getElementById("none").checked + ""
    localStorage["showPrivate"] = document.getElementById("private").checked + ""

  restoreOptions: =>
    showPublic = localStorage["showPublic"]
    showProtected = localStorage["showProtected"]
    showNone = localStorage["showNone"]
    showPrivate = localStorage["showPrivate"]
    if showPublic is `undefined` or showProtected is `undefined` or showNone is `undefined` or showPrivate is `undefined`
      showPublic = "true"
      showProtected = showNone = showPrivate = "false"
    document.getElementById("public").checked = (showPublic is "true")
    document.getElementById("protected").checked = (showProtected is "true")
    document.getElementById("none").checked = (showNone is "true")
    document.getElementById("private").checked = (showPrivate is "true")
    @saveToLocalStorage()
  
(->
  options = new Options()
  options.restoreOptions()
  document.getElementById("saveButton").addEventListener "click", options.saveOptions
)()