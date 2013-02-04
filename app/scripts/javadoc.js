(function() {
  var Japarser;

  Japarser = (function() {

    function Japarser() {}

    Japarser.prototype.getModifier = function(modifiersName) {
      var modifier;
      modifier = "";
      if (/public/.test(modifiersName)) {
        modifier = "+";
      } else if (/protected/.test(modifiersName)) {
        modifier = "#";
      } else if (/private/.test(modifiersName)) {
        modifier = "-";
      }
      return modifier;
    };

    Japarser.prototype.buildClassDef = function(className, fields, methods) {
      var classDef;
      classDef = "[" + className + "|" + fields + "|" + methods + "]";
      return classDef;
    };

    Japarser.prototype.generateImage = function(json, scruffy, direction, scale) {
      var classDef, diagram, fields, i, interfaceDef, len, methods, requestUrl, superClassDef;
      if (scruffy == null) {
        scruffy = false;
      }
      if (direction == null) {
        direction = "dir:lr";
      }
      if (scale == null) {
        scale = 80;
      }
      fields = "";
      i = 0;
      len = json.fields.length;
      while (i < len) {
        fields += (this.getModifier(json.fields[i].modifiersName) + json.fields[i].name + ";").replace(/\[/g, "［").replace(/\]/g, "］");
        i++;
      }
      methods = "";
      i = 0;
      len = json.methods.length;
      while (i < len) {
        methods += (this.getModifier(json.methods[i].modifiersName) + json.methods[i].name + "(" + json.methods[i].paramName + "):" + json.methods[i].returnName + ";").replace(/\[/g, "［").replace(/\]/g, "］");
        i++;
      }
      classDef = this.buildClassDef(json.name, fields, methods);
      superClassDef = ((json.extendsClasses != null) ? "[" + json.extendsClasses[0].name + "]^-" : "");
      diagram = "";
      interfaceDef = "";
      if (json.implementsInterfaces != null) {
        i = 0;
        len = json.implementsInterfaces.length;
        while (i < len) {
          interfaceDef += "[" + json.implementsInterfaces[i].name + "]^-.-" + classDef + ",";
          i++;
        }
      }
      diagram += interfaceDef;
      diagram += (superClassDef !== "" ? superClassDef + classDef : "");
      diagram = (interfaceDef === "" && superClassDef === "" ? classDef : diagram);
      diagram = diagram.replace(/</g, "‹").replace(/>/g, "›").replace(/,/g, "‚");
      requestUrl = "http://yuml.me/diagram/scale:" + scale + ";" + direction;
      if (scruffy) {
        requestUrl = requestUrl + ";scruffy";
      }
      requestUrl = requestUrl + "/class/" + encodeURIComponent(diagram);
      return "<img id=\"classDiagram\" src=\"" + requestUrl + "\" alt=\"" + json.name + "\" />";
    };

    return Japarser;

  })();

  if (!this.java2yuml) {
    this.java2yuml = {};
  }

  this.java2yuml.Japarser = Japarser;

}).call(this);

(function() {

  (function() {
    var execute,
      _this = this;
    execute = function() {
      return chrome.extension.sendRequest({
        action: "isRunning"
      }, function(response) {
        var decodeHtml, extractFields, extractMethods;
        if (response === null || response === "" || response === "false") {
          return;
        }
        decodeHtml = function(html) {
          var decoded;
          return decoded = html.replace(/&nbsp;/g, "").replace(/&gt;/g, "").replace(/&lt;/g, "").replace(/&amp;/, "");
        };
        extractFields = function(_document, showModifiers) {
          var fieldName, fieldType, fields, fieldsTable, i, modifiersName, nameRef, rows;
          fields = [];
          try {
            nameRef = _document.getElementsByName("field_summary")[0];
            fieldsTable = nameRef.nextElementSibling;
            if (fieldsTable == null) {
              fieldsTable = nameRef.parentElement.nextElementSibling;
            }
            rows = fieldsTable.rows;
            i = 0;
            while (i++ < rows.length) {
              if (i === 0) {
                continue;
              }
              fieldType = rows[i].cells[0].innerText;
              fieldName = rows[i].cells[1].innerText.split(" ")[0];
              modifiersName = "";
              if (/protected\s/.test(fieldType)) {
                if (showModifiers.showProtected !== "true") {
                  continue;
                }
                modifiersName = "protected";
                fieldType = fieldType.replace(/protected\s/, "");
              } else if (/private\s/.test(fieldType)) {
                if (showModifiers.showPrivate !== "true") {
                  continue;
                }
                modifiersName = "private ";
                fieldType = fieldType.replace(/private\s/, "");
              } else if (/package\sprivate\s/.test(fieldType)) {
                if (showModifiers.showNone !== "true") {
                  continue;
                }
                fieldType = fieldType.replace("package private ", "");
              } else {
                if (showModifiers.showPublic !== "true") {
                  continue;
                }
                modifiersName = "public";
                fieldType = fieldType.replace(/public\s/, "");
              }
              if (/static\s/.test(fieldType)) {
                if (modifiersName !== "") {
                  modifiersName = modifiersName + " ";
                }
                modifiersName = modifiersName + "static";
                fieldType = fieldType.replace(/static\s/, "");
              }
              if (/final\s/.test(fieldType)) {
                if (modifiersName !== "") {
                  modifiersName = modifiersName + " ";
                }
                modifiersName = modifiersName + "final";
                fieldType = fieldType.replace(/final\s/, "");
              }
              fields.push({
                line: 0,
                modifiersName: modifiersName.replace(/^\s+|\s+$/, ""),
                name: fieldName.replace(/^\s+|\s+$/, ""),
                qualifiedTypeName: fieldType.replace(/^\s+|\s+$/, ""),
                simpleTypeName: fieldType.replace(/^\s+|\s+$/, "")
              });
            }
          } catch (e) {
            console.log(e);
          }
          return fields;
        };
        extractMethods = function(_document, showModifiers) {
          var i, methodNameWithParams, methodNameWithParamsSplit, methods, methodsTable, modifiersName, name, nameRef, paramName, returnType, rows, _ref;
          methods = [];
          try {
            nameRef = _document.getElementsByName("method_summary")[0];
            methodsTable = nameRef.nextElementSibling;
            if (methodsTable == null) {
              methodsTable = nameRef.parentElement.nextElementSibling;
            }
            rows = methodsTable.rows;
            i = 0;
            while (i++ < rows.length) {
              if (i === 0) {
                continue;
              }
              returnType = rows[i].cells[0].innerText;
              methodNameWithParams = rows[i].cells[1].getElementsByTagName("code")[0].innerText;
              modifiersName = "";
              if (/protected\s/.test(returnType)) {
                if (showModifiers.showProtected !== "true") {
                  continue;
                }
                modifiersName = "protected";
                returnType = returnType.replace(/protected\s/, "");
              } else if (/private\s/.test(returnType)) {
                if (showModifiers.showPrivate !== "true") {
                  continue;
                }
                modifiersName = "private";
                returnType = returnType.replace(/private\s/, "");
              } else if (/package\sprivate\s/.test(returnType)) {
                if (showModifiers.showNone !== "true") {
                  continue;
                }
                returnType = returnType.replace(/package\sprivate\s/, "");
              } else {
                if (showModifiers.showPublic !== "true") {
                  continue;
                }
                modifiersName = "public";
                returnType = returnType.replace(/public\s/, "");
              }
              if (/static\s/.test(returnType)) {
                if (modifiersName !== "") {
                  modifiersName = modifiersName + " ";
                }
                modifiersName = modifiersName + "static";
                returnType = returnType.replace(/static\s/, "");
              }
              if (/final\s/.test(returnType)) {
                if (modifiersName !== "") {
                  modifiersName = modifiersName + " ";
                }
                modifiersName = modifiersName + "final";
                returnType = returnType.replace(/final\s/, "");
              }
              methodNameWithParamsSplit = methodNameWithParams.split("(");
              name = "";
              name = methodNameWithParamsSplit != null ? methodNameWithParamsSplit[0] : void 0;
              paramName = "";
              paramName = methodNameWithParamsSplit != null ? (_ref = methodNameWithParamsSplit[1]) != null ? _ref.replace(")", "") : void 0 : void 0;
              methods.push({
                constructor: false,
                line: 0,
                modifiersName: modifiersName.replace(/^\s+|\s+$/, ""),
                name: name.replace(/^\s+|\s+$/, ""),
                paramName: paramName.replace(/^\s+|\s+$/, ""),
                returnName: returnType.replace(/^\s+|\s+$/, "")
              });
            }
          } catch (e) {
            console.log(e);
          }
          return methods;
        };
        return (function() {
          var classInfo, className, classView, fields, frame, isInterface, methods, options, packageName, qualifiedTypeName, _document;
          _document = document;
          options = response;
          packageName = "";
          className = "";
          isInterface = false;
          try {
            packageName = _document.querySelector("html>body>h2>font").innerText;
            className = _document.querySelector("html>body>dl>dt>pre>b").innerText;
            isInterface = /interface\s/.test(_document.querySelector("html>body>dl>dt>pre").innerText);
          } catch (e) {
            try {
              frame = _document.getElementsByName("classFrame")[0];
              _document = frame.contentDocument;
              frame.addEventListener("load", arguments_.callee);
              packageName = _document.querySelector("html>body>h2>font").innerText;
              className = _document.querySelector("html>body>dl>dt>pre>b").innerText;
              isInterface = /interface\s/.test(_document.querySelector("html>body>dl>dt>pre").innerText);
            } catch (e2) {
              console.error(e2);
              return;
            }
          }
          if (packageName !== "") {
            qualifiedTypeName = packageName + "." + className;
          } else {
            qualifiedTypeName = className;
          }
          fields = extractFields(_document, options.showModifiers);
          methods = extractMethods(_document, options.showModifiers);
          classInfo = {
            "interface": isInterface,
            line: 0,
            name: className.replace(/^\s+|\s+$/, ""),
            qualifiedTypeName: qualifiedTypeName.replace(/^\s+|\s+$/, ""),
            fields: fields,
            methods: methods
          };
          classView = _document.createElement("div");
          classView.id = "classView";
          classView.setAttribute("style", "z-index: 100; top:10px; right:10px; opacity: 0.8; background-color:#fff; overflow: auto; max-height: 800px; max-width: 960px; position:fixed;");
          classView.innerHTML = new java2yuml.Japarser().generateImage(classInfo, false, "dir:lr");
          if (classInfo.name !== "") {
            return _document.body.appendChild(classView);
          }
        })();
      });
    };
    return execute();
  })();

}).call(this);
