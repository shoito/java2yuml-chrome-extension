(->
  execute = =>
    chrome.extension.sendRequest
      action: "isRunning"
    , (response) ->
      return  if response is null or response is "" or response is "false"

      decodeHtml = (html) ->
        decoded = html.replace(/&nbsp;/g, "").replace(/&gt;/g, "").replace(/&lt;/g, "").replace(/&amp;/, "")

      extractFields = (_document, showModifiers) ->
        fields = []
        try
          nameRef = _document.getElementsByName("field_summary")[0]
          fieldsTable = nameRef.nextElementSibling
          fieldsTable = nameRef.parentElement.nextElementSibling  unless fieldsTable?
          rows = fieldsTable.rows
          i = 0

          while i++ < rows.length
            continue  if i is 0
            fieldType = rows[i].cells[0].innerText
            fieldName = rows[i].cells[1].innerText.split(" ")[0]
            # fieldType = decodeHtml fieldType
            # fieldName = decodeHtml fieldName

            modifiersName = ""

            if /protected\s/.test fieldType
              continue  unless showModifiers.showProtected is "true"
              modifiersName = "protected"
              fieldType = fieldType.replace /protected\s/, ""
            else if /private\s/.test fieldType
              continue  unless showModifiers.showPrivate is "true"
              modifiersName = "private "
              fieldType = fieldType.replace /private\s/, ""
            else if /package\sprivate\s/.test fieldType
              continue  unless showModifiers.showNone is "true"
              fieldType = fieldType.replace("package private ", "")
            else
              continue  unless showModifiers.showPublic is "true"
              modifiersName = "public"
              fieldType = fieldType.replace /public\s/, ""

            if /static\s/.test fieldType
              modifiersName = modifiersName + " " if modifiersName isnt ""
              modifiersName = modifiersName + "static"
              fieldType = fieldType.replace /static\s/, ""

            if /final\s/.test fieldType
              modifiersName = modifiersName + " " if modifiersName isnt ""
              modifiersName = modifiersName + "final"
              fieldType = fieldType.replace /final\s/, ""

            fields.push {
              line: 0
              modifiersName: modifiersName.replace /^\s+|\s+$/, ""
              name: fieldName.replace /^\s+|\s+$/, ""
              qualifiedTypeName: fieldType.replace /^\s+|\s+$/, ""
              simpleTypeName: fieldType.replace /^\s+|\s+$/, ""
            }
        catch e
          console.log e
        fields

      extractMethods = (_document, showModifiers) ->
        methods = []
        try
          nameRef = _document.getElementsByName("method_summary")[0]
          methodsTable = nameRef.nextElementSibling
          methodsTable = nameRef.parentElement.nextElementSibling  unless methodsTable?
          rows = methodsTable.rows
          i = 0

          while i++ < rows.length
            continue  if i is 0
            returnType = rows[i].cells[0].innerText
            methodNameWithParams = rows[i].cells[1].getElementsByTagName("code")[0].innerText
            # fieldName = decodeHtml returnType
            # fieldName = decodeHtml methodNameWithParams

            modifiersName = ""
            if /protected\s/.test returnType
              continue  unless showModifiers.showProtected is "true"
              modifiersName = "protected"
              returnType = returnType.replace /protected\s/, ""
            else if /private\s/.test returnType
              continue  unless showModifiers.showPrivate is "true"
              modifiersName = "private"
              returnType = returnType.replace /private\s/, ""
            else if /package\sprivate\s/.test returnType
              continue  unless showModifiers.showNone is "true"
              returnType = returnType.replace /package\sprivate\s/, ""
            else
              continue  unless showModifiers.showPublic is "true"
              modifiersName = "public"
              returnType = returnType.replace /public\s/, ""

            if /static\s/.test returnType
              modifiersName = modifiersName + " " if modifiersName isnt ""
              modifiersName = modifiersName + "static"
              returnType = returnType.replace /static\s/, ""

            if /final\s/.test returnType
              modifiersName = modifiersName + " " if modifiersName isnt ""
              modifiersName = modifiersName + "final"
              returnType = returnType.replace /final\s/, ""

            methodNameWithParamsSplit = methodNameWithParams.split "("
            name = ""
            name = methodNameWithParamsSplit?[0]
            paramName = ""
            paramName = methodNameWithParamsSplit?[1]?.replace ")", ""

            methods.push {
              constructor: false
              line: 0
              modifiersName: modifiersName.replace /^\s+|\s+$/, ""
              name: name.replace /^\s+|\s+$/, ""
              paramName: paramName.replace /^\s+|\s+$/, ""
              returnName: returnType.replace /^\s+|\s+$/, ""
            }

        catch e
          console.log e
        methods

      (->
        _document = document
        options = response
        packageName = ""
        className = ""
        isInterface = false
        try
          packageName = _document.querySelector("html>body>h2>font").innerText
          className = _document.querySelector("html>body>dl>dt>pre>b").innerText
          isInterface = /interface\s/.test _document.querySelector("html>body>dl>dt>pre").innerText
        catch e
          try
            frame = _document.getElementsByName("classFrame")[0]
            _document = frame.contentDocument
            frame.addEventListener "load", arguments_.callee
            packageName = _document.querySelector("html>body>h2>font").innerText
            className = _document.querySelector("html>body>dl>dt>pre>b").innerText
            isInterface = /interface\s/.test _document.querySelector("html>body>dl>dt>pre").innerText
          catch e2
            console.error e2
            return

        if packageName isnt ""
          qualifiedTypeName = packageName + "." + className
        else
          qualifiedTypeName = className

        fields = extractFields(_document, options.showModifiers)
        methods = extractMethods(_document, options.showModifiers)
        classInfo = {
          interface: isInterface
          line: 0
          name: className.replace /^\s+|\s+$/, ""
          qualifiedTypeName: qualifiedTypeName.replace /^\s+|\s+$/, ""
          fields: fields
          methods: methods
        }

        classView = _document.createElement("div")
        classView.id = "classView"
        classView.setAttribute "style", "z-index: 100; top:10px; right:10px; opacity: 0.8; background-color:#fff; overflow: auto; max-height: 800px; max-width: 960px; position:fixed;"
        classView.innerHTML = new java2yuml.Japarser().generateImage(classInfo, false, "dir:lr")
        _document.body.appendChild classView  unless classInfo.name is ""
      )()

  execute()
)()