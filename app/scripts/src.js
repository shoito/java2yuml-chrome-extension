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
    var clearClass, execute, pjaxClickHandler,
      _this = this;
    execute = function() {
      return chrome.extension.sendRequest({
        action: "getClassInfo"
      }, function(response) {
        if (response === null || response === "" || response === "false") {
          return;
        }
        return (function() {
          var classInfo, classView, _document;
          _document = document;
          classInfo = response;
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
    clearClass = function() {
      var cv;
      cv = document.getElementById("classView");
      if (cv) {
        return cv.parentElement.removeChild(cv);
      }
    };
    pjaxClickHandler = function(event) {
      if (event.target.nodeName === "A" || event.target.nodeName === "SPAN") {
        clearClass();
        if (/\.java/.test(event.target.innerText)) {
          return execute();
        }
      }
    };
    window.addEventListener("click", function(event) {
      if (window.location.hostname === "github.com") {
        return pjaxClickHandler(event);
      }
    });
    document.addEventListener("click", function(event) {
      if (window.location.hostname === "bitbucket.org") {
        return pjaxClickHandler(event);
      }
    });
    return execute();
  })();

}).call(this);
