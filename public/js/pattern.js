/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

var attrsPostfix = '_attrs';


/*****
 * Helper function to locate an entity based on the id of the source.
 * 
 * Used by findEntityInPath()
 * 
 * @param {type} elemEntity
 * @param {type} id
 * @returns {findEntityWithSource.elem}
 */
function findEntityWithSource(elemEntity, id)
{
  var elem = null;
  if (elemEntity.from.id === id) {
    elem = elemEntity;
  } else if (elemEntity.to != []) {
    for (var i = 0; i < elemEntity.to.length; i++) {
      elem = findEntityWithSource(elemEntity.to[i], id)
      if (elem !== null)
        return elem;
    }
  }
  return elem;
}

/*****
 * Helper function to located an entity in the path if we already
 * have it...
 * 
 * Used by getPaths()
 * 
 * @param {type} pathList
 * @param {type} id
 * @returns {findEntityInPath.elem}
 */
function findEntityInPath(pathList, id)
{
  var elem = null;
  for (var i = 0; i < pathList.length; i++) {
      elem = findEntityWithSource(pathList[i], id);
      if (elem !== null)
        break;
  }
  return elem;
}

/*****
 * Public function to extract information from the selected nodes and how they 
 * are connected in the graph (edges) and construct a path for them to be used
 * to generate a pattern.
 * 
 * @param {type} nodeList
 * @param {type} sigmaGraph
 * @returns {Array|getPaths.pathList}
 */
function getPaths(nodeList, sigmaGraph)
{
  var pathList = [];
  var ids = [];
  for (var key in nodeList) {
    ids.push(key);
  }
  sigmaGraph.graph.edges().forEach(function (e) {
    
    if (ids.includes(e.source) && ids.includes(e.target)) {
      var entity = findEntityInPath(pathList, e.source);
      if (entity == null)
      {
        // create an entity
        entity = {
              from: nodeList[e.source],
              to: [] //[{id: e.target, data: nodeList[e.target]}]
            };
        pathList.push(entity);
      }
      if (entity !== null) // add the "to" information
      {
        // to avoid loops, then we need to check if our target for this entry is
        // already in the path.
        if (findEntityInPath(pathList, e.target) == null)
        {
          entity.to.push({ 
              from: nodeList[e.target],
              to: []
            });
        }
      }
    }
  });
  return pathList;
}


/*****
 * Internal function used to process collected data from nodes/edges selected
 * Internal function to group each level of collected information into a list
 * of classes and list of object (which contain the data from the nodes)
 * @param {type} pathElement
 * @param {type} collectedInfo
 * @returns {undefined}
 */
function groupPathElements(pathElement, collectedInfo)
{
  for (var key in pathElement.to) {
    if (collectedInfo.next == null)
      collectedInfo.next = {};
    var nextElement = pathElement.to[key];
    groupPathElements(nextElement, collectedInfo.next);
  }
  
  if (collectedInfo.classes == null) {
    collectedInfo.classes = []; 
    collectedInfo.objects = [];
  }
  
  collectedInfo.classes.push(pathElement.from.className);
  collectedInfo.objects.push(pathElement.from);
}

/*****
 * Internal function that go through all collected infos in a path and aggregate
 * the type and attributes found for node groups to be able to show the information
 * and ranges to the GUI for configuaration.
 * 
 * It does add an attribute 'node' to each level, which will contain the class
 * and an attribute information for each class attributes. 
 * 
 * If the information on a level are not coherent, then the 'node' added will be
 * empty
 * 
 * @param {type} collectedInfo
 * @returns {undefined}
 */
function aggregateCollectedInfo(collectedInfo)
{
  collectedInfo.node = {};
  // check the classes.
  var className = "";
  var attributes = {};

  for (var i = 0; i < collectedInfo.classes.length; i++)
  {
    if (className === "")
      className = collectedInfo.classes[i];
    else {
      if (className !== collectedInfo.classes[i]) {
        className = ""; // no specific class to configure.
        break;
      }
    }
  }
  collectedInfo.node['class'] = className;
  
  if (className !== "")
  {
    // aggregateAttributes
    for (var i = 0; i < collectedInfo.objects.length; i++)
    {
      var classAttributes = collectedInfo.objects[i].attributes;
      for (var prop in classAttributes) {
        if (className !== 'Block' && prop === 'm_Id')
          continue; // we'll ignore all other m_Id except for block.
        if ((typeof classAttributes[prop] === 'string') &&
           (classAttributes[prop].startsWith('#')))
        {
          // we don't want to show OID, there is no point.
            continue;
        }
        if ((typeof classAttributes[prop] === 'number'))
        {
          if (attributes[prop] == null)
            attributes[prop] = {min: Number.MAX_SAFE_INTEGER, max:0};
          attributes[prop]['min'] = Math.min(attributes[prop]['min'], classAttributes[prop]);
          attributes[prop]['max'] = Math.max(attributes[prop]['max'], classAttributes[prop]);
          //console.log(">", prop, " : ", classAttributes[prop])
        }
        else {
          // in our types, what's left is a string or a boolean.
          // pick the first string attribute but if there is more than
          // one value (i.e. in the group of attributes) and they are differ
          // then no attributes is picked.
          if (attributes[prop] == null)
            attributes[prop] = classAttributes[prop];
          else if (attributes[prop] !== classAttributes[prop])
            attributes[prop] = "";
        }
      }
    }
  }
  
  collectedInfo.node['attributes'] = attributes;

  if (collectedInfo.next)
    aggregateCollectedInfo(collectedInfo.next);
}

/*****
 * Public function that will process the paths generated after analyzing the
 * selected nodes and edges.
 * 
 * @param {type} pathList
 * @returns {Array|processPaths.collectedInfos}
 */
function processPaths(pathList) 
{ 
  var collectedInfos = [];
  for (var key in pathList) {
    var collectedInfo = {}
    groupPathElements(pathList[key], collectedInfo);
    collectedInfos.push(collectedInfo);
  }
  
  for (var key in collectedInfos) {
    aggregateCollectedInfo(collectedInfos[key]);
  }
  return collectedInfos;
}

/*****
 * Helper function to allow us to use Length(LIST) for attributes that are lists
 * 
 * @param {type} attrName
 * @returns {String}
 */
function getCorrectedAttrName(attrName)
{
  if (attrName === 'm_Inputs' || attrName === 'm_Outputs' || attrName === 'm_Transactions')
    return "LENGTH(" + attrName + ")";
  return attrName; 
}

/*****
 * Internal function that construct the attributeList of a Do statment from
 * the configured params.
 * 
 * @param {type} collectedInfo
 * @returns {String}
 */
function constructDoAttributes(collectedInfo)
{
  var doAttributes = "";
  var infoNode = collectedInfo.node;
  for (var prop in infoNode.attributes)
  {
    var attrValue = infoNode.attributes[prop]
    var attrName = prop;
    
    if (typeof attrValue === 'string' && attrValue === "")
      continue;
    
    if (doAttributes !== "")
      doAttributes = doAttributes + ' AND ';
    
    if (typeof attrValue === 'object') {
      attrName = getCorrectedAttrName(attrName);
      if (attrValue.min == attrValue.max) {
        doAttributes = doAttributes + attrName + ' == ' + attrValue.min;
      } else {
        doAttributes = doAttributes + attrName + ' >= '+
              attrValue.min + " AND " + attrName + ' <= ' + attrValue.max;
      }
    }
    else {
      if (typeof attrValue === 'string') {
        attrValue = '"' + attrValue + '"';
      }
      doAttributes = doAttributes + attrName + ' == ' + attrValue;
    }
  }
  if (doAttributes !== "") {
    doAttributes = ' {' + doAttributes + '}';
  }
  return doAttributes;
}
/****
 * Public function to get information from the configured 'node' of the collectedInfo
 * and construct a DO component that is used int he graph query to represet the 
 * type and any parameters.
 * 
 * @param {type} collectedInfo
 * @returns {String}
 */
function costructDoComponent(collectedInfo)
{
  var doComponent = "()";
  var infoNode = collectedInfo.node;
  if (infoNode != null)
  {
    if (infoNode.class == "")
      doComponent = "()";
    else {
      var doAttributes = constructDoAttributes(collectedInfo);
      doComponent = "(:" + infoNode.class + doAttributes + ")"
    }
  }
  return doComponent;
}
/************************************
 * GUI functions for pattern configuration...
 ************************************/

function createAttrDivGuiElement(attrName, classAttributes) 
{
  var tr = document.createElement('div');
  var tdName = document.createElement('label');
  tdName.innerHTML = attrName;
  tr.appendChild(tdName);

  var attrValue = classAttributes[attrName];
  
  if (typeof attrValue === 'object')
  {
    var tdValueMin = document.createElement('input');
    var tdValueMax = document.createElement('input');

    tdValueMin.value = attrValue.min;
    tdValueMin._attrs = classAttributes;
    tdValueMin._attrName = attrName;
    tdValueMin._sibling = tdValueMax;
    tdValueMin.onchange = function() {
      var attrs = this._attrs;
      var attrName = this._attrName;
      attrs[attrName].min = this.value;
      if (Number(this.value) > Number(this._sibling.value)) {
        attrs[attrName].max = this.value;
        this._sibling.value = this.value;
      }
    }
    
    tr.appendChild(tdValueMin);

    tdValueMax.value = attrValue.max;
    tdValueMax._attrs = classAttributes;
    tdValueMax._attrName = attrName;
    tdValueMax._sibling = tdValueMin;
    tdValueMax.onchange = function() {
      var attrs = this._attrs;
      var attrName = this._attrName;
      attrs[attrName].max = this.value;
      if (Number(this.value) < Number(this._sibling.value)) {
        attrs[attrName].min = this.value;
        this._sibling.value = this.value;
      }
    }
    tr.appendChild(tdValueMax);

  }
  else {
    var tdValue = document.createElement('input');
//    tdValue.style.height = '20px';
    tdValue.value = attrValue;
    tdValue._attrs = classAttributes;
    tdValue._attrName = attrName;
    tdValue.onchange = function() {
      var attrs = this._attrs;
      var attrName = this._attrName;
      attrs[attrName] = this.value;
    }
    tr.appendChild(tdValue);

  }
  return tr;
}

function createAttributesDivGuiElement(id, collectedInfo)
{
  var attributesDiv = document.createElement("div");
  attributesDiv.id = id;
  attributesDiv.style.display = 'none';
//  var classAttributes = collectedInfo.objects[0].attributes;
  var classAttributes = collectedInfo.node.attributes;
  for (var prop in classAttributes) {
    //console.log(">", prop, " : ", classAttributes[prop])
    var attrDiv = createAttrDivGuiElement(prop, classAttributes);
    attributesDiv.appendChild(attrDiv);
  }
  return attributesDiv;
}

function createTypeGuiElement(id, collectedInfo)
{
    var element = document.createElement("input");
    
    //Assign different attributes to the element.
//    element.setAttribute("type", "text");
    element.id = id;
    element.style.width = '100px';
    element.style.height = '30px';
    element.style.borderRadius = '25px';
//    element.value = collectedInfo.classes[0];
    element.value = collectedInfo.node.class;
    element.payload = collectedInfo;
    element.readOnly = true;
    element.ondblclick = function() {
      this.readOnly = false;
    }
    element.onchange = function() {
      this.payload.node.class = this.value.trim();
    }
    element.onclick = function() {
      this.readOnly = true;  // make sure we don't allow editing of the text
      if (window.currentAttributesHolder != null)
        window.currentAttributesHolder.style.display = 'none';
      //var objectInfo = this.payload.objects[0];
      var attributesHolder = document.getElementById(this.id+attrsPostfix);
      attributesHolder.style.display = 'block';
      window.currentAttributesHolder = attributesHolder;
    }  
    
    return element;
}

/*****
 * Public function to construct the pattern configuation GUI
 * 
 * @param {type} collectedInfo
 * @param {type} parentDiv
 * @returns {Array|createPatternNodes.elements}
 */
function createPatternGuiNodes(collectedInfo, parentDiv)
{
  var elements = [];
  var idBase = 'CEID_';
  var count = 1;

  var classAttributesConfig = document.getElementById('class-attributes-config');

  while (collectedInfo != null) 
  {
    //Create an input type dynamically.
    var element = createTypeGuiElement(idBase + count, collectedInfo)

    elements.push(element);
    parentDiv.appendChild(element);

    // create the attribute holder.
    var attributesDiv = createAttributesDivGuiElement(element.id + attrsPostfix, collectedInfo)
    elements.push(attributesDiv);
    classAttributesConfig.appendChild(attributesDiv);

    if (collectedInfo.next != null)
    {
      //Create arrows
      var arrow = document.createElement("Label");
      elements.push(arrow);
      
      arrow.style = "font-weight:normal";

      arrow.innerHTML = "-->";     
      //Append the element to the Div
      parentDiv.appendChild(arrow);
    }
    
    collectedInfo = collectedInfo.next;
    count++;
  }  
  
  return elements;
}

function cleanupPatternGuiElements(createdElements)
{
  for (var i = 0; i < createdElements.length; i++) {
    var parent = createdElements[i].parentElement;
    parent.removeChild(createdElements[i]);
  }
  window.currentAttributesHolder = null;
}
