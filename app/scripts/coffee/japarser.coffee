class Japarser
  getModifier: (modifiersName) ->
    modifier = ""
    if /public/.test modifiersName
      modifier = "+"
    else if /protected/.test modifiersName
      modifier = "#"
    else if /private/.test modifiersName 
      modifier = "-"
    modifier

  buildClassDef: (className, fields, methods) ->
    classDef = "[" + className + "|" + fields + "|" + methods + "]"
    classDef

  generateImage: (json, scruffy = false, direction="dir:lr", scale=80) ->
    fields = ""
    i = 0
    len = json.fields.length

    while i < len
      fields += (@getModifier(json.fields[i].modifiersName) + json.fields[i].name + ";").replace(/\[/g, "［").replace(/\]/g, "］") #u005B, u005D is NG
      i++

    methods = ""
    i = 0
    len = json.methods.length

    while i < len
      methods += (@getModifier(json.methods[i].modifiersName) + json.methods[i].name + "(" + json.methods[i].paramName + "):" + json.methods[i].returnName + ";").replace(/\[/g, "［").replace(/\]/g, "］")
      i++

    classDef = @buildClassDef(json.name, fields, methods)
    superClassDef = (if (json.extendsClasses?) then "[" + json.extendsClasses[0].name + "]^-" else "")

    diagram = ""
    interfaceDef = ""
    if json.implementsInterfaces?
      i = 0
      len = json.implementsInterfaces.length

      while i < len
        interfaceDef += ("[" + json.implementsInterfaces[i].name + "]^-.-" + classDef + ",")
        i++
        
    diagram += interfaceDef
    diagram += ((if (superClassDef isnt "") then superClassDef + classDef else ""))
    diagram = (if (interfaceDef is "" and superClassDef is "") then classDef else diagram)
    diagram = diagram.replace(/</g, "‹").replace(/>/g, "›").replace(/,/g, "‚")
    requestUrl = "http://yuml.me/diagram/scale:#{scale};#{direction}"
    requestUrl = requestUrl + ";scruffy"  if scruffy
    requestUrl = requestUrl + "/class/" + encodeURIComponent(diagram)
    "<img id=\"classDiagram\" src=\"" + requestUrl + "\" alt=\"" + json.name + "\" />"

@java2yuml = {} unless @java2yuml
@java2yuml.Japarser = Japarser