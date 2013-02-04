(function() {
  var Options;

  Options = (function() {

    function Options() {}

    Options.prototype.saveOptions = function() {
      var status;
      this.saveToLocalStorage();
      status = document.getElementById("status");
      status.innerHTML = "Options Saved.";
      return setTimeout((function() {
        return status.innerHTML = "";
      }), 750);
    };

    Options.prototype.saveToLocalStorage = function() {
      localStorage["showPublic"] = document.getElementById("public").checked + "";
      localStorage["showProtected"] = document.getElementById("protected").checked + "";
      localStorage["showNone"] = document.getElementById("none").checked + "";
      return localStorage["showPrivate"] = document.getElementById("private").checked + "";
    };

    Options.prototype.restoreOptions = function() {
      var showNone, showPrivate, showProtected, showPublic;
      showPublic = localStorage["showPublic"];
      showProtected = localStorage["showProtected"];
      showNone = localStorage["showNone"];
      showPrivate = localStorage["showPrivate"];
      if (showPublic === undefined || showProtected === undefined || showNone === undefined || showPrivate === undefined) {
        showPublic = "true";
        showProtected = showNone = showPrivate = "false";
      }
      document.getElementById("public").checked = showPublic === "true";
      document.getElementById("protected").checked = showProtected === "true";
      document.getElementById("none").checked = showNone === "true";
      document.getElementById("private").checked = showPrivate === "true";
      return this.saveToLocalStorage();
    };

    return Options;

  })();

  (function() {
    var options;
    options = new Options();
    options.restoreOptions();
    return document.getElementById("saveButton").addEventListener("click", options.saveOptions);
  })();

}).call(this);
