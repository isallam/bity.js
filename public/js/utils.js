
var Utils = {
		
    removeSelectOptions : function(obj) {
        while(obj.options.length > 1) // we'll need to leave the first for "All..."
            obj.remove(obj.options.length-1);
    },

    hide : function(elemId) {
	var elem = document.getElementById(elemId);
	elem.style.visibility = 'hidden';
    },

    show : function(elemId) {
	document.getElementById(elemId).style.visibility = 'visible';
    },

	toggle : function(elemId) {
		var elem = document.getElementById(elemId);
		if (elem.style.visibility === 'visible')
			elem.style.visibility = 'hidden';
		else
			elem.style.visibility = 'visible';
	},

    eraseElem : function (elemId) {
	document.getElementById(elemId).style.display = 'none';
    },

    ratifyElem : function (elemId) {
	document.getElementById(elemId).style.display = 'block';
    },
    
    addNodeToGraph : function(graph, nodeId, nodeClass, nodeData = null) {
        if (graph.nodes(nodeId) == null) {
          graph.addNode( {
            id: nodeId,
            label: nodeClass,
            x: Math.random(),
            y: Math.random(),
            level: 3,
            size: getNodeSize(nodeClass), //Math.random(),
            color: getColor(nodeClass), //'#666',
            image: {
                url: getUrl(nodeClass),
                // scale/clip are ratio values applied on top of 'size'
                scale: 1.2,
                clip: 1.0,
            },
            data: nodeData
          })
        }
    },
    
    addEdgeToGraph : function(graph, fromId, toId, edgeAttribute) {
      var edgeId = fromId + ":" + toId
      if (graph.edges(edgeId) == null) {
        graph.addEdge({
            id: edgeId,
            source: fromId,
            target: toId,
            size: 20,
//            level: 2,
            type: 'curvedArrow',
            arrowRatio: 3,
            // color: getEdgeColor(sGraph.graph, qResult.edge.source),
            hover_color: '#000',
            label: edgeAttribute
        })
      }
    },
    
    updateGraphNode : function(graph, nodeId, nodeClass, nodeData) {
        var node = graph.nodes(nodeId);
        if (node == null) {
          graph.addNode( {
            id: nodeId,
            label: nodeClass,
            x: Math.random(),
            y: Math.random(),
            level: 3,
            size: getNodeSize(nodeClass), //Math.random(),
            color: getColor(nodeClass), //'#666',
            image: {
                url: getUrl(nodeClass),
                // scale/clip are ratio values applied on top of 'size'
                scale: 1.2,
                clip: 1.0,
            },
            data: nodeData
          })
        } else {
          node.data = nodeData
        }
    },
    
};

var simpleTemplate = '<div class="arrow"></div>' +
	' <div class="sigma-tooltip-header">{{label}}</div>' +
	'  <div class="sigma-tooltip-body">' +
	'    <table>' +
	'      <tr><th>ID</th> <td>{{data.m_Id}}</td></tr>' +
	'      <tr><th>OID</th> <td>{{id}}</td></tr>' +
	'    </table>' +
	'  </div>' +
	'  <div class="sigma-tooltip-footer">Number of connections: {{degree}}</div>';

var ToolTipSelectiveAttributes = {
  'Block'       : ["_id", "_version", "_time", "_hash", "_transactions"],
  'Transaction' : ["_id", "_blockId", "_hash", "_mintTime", "_inValue", "_outValue", 
                   "_numInputs", "_numOutputs", "_isCoinBase"],
  'GenTransaction' : ["_id", "_hash", "_mintTime", "_inValue", "_outValue", 
                   "_isCoinBase", "numChildren", "_numOutputs"],
  'Input'       : ["_index", "_value", "_parentIndex"],
  'Output'      : ["_index", "_value"],
  'Address'     : ["_hash", "_outValue", "_numOutputs"],
  'Tag'         : ['_label', '_ref']
};

var simpleTemplate2 = '<div class="arrow"></div>' +
	' <div class="sigma-tooltip-header">{{label}}</div>' +
	'  <div class="sigma-tooltip-body">' +
	'    <table> {{>table_elements}} </table>' + 
	'    </table>' +
	'  </div>' +
	'  <div class="sigma-tooltip-footer">Number of connections: {{degree}}</div>';


function getTemplate(nodeLabel) {
    return simpleTemplate2;
}

function getNodeSize (label) {
	var retVal = 6;

	if (label === 'Input' || label === 'Output') {
		retVal = 2;
//	} else if (label === 'Block') {
//      retVal = node.data.m_Transactions/10;
//    } else if (label === 'Address') {
//      retVal = node.data.m_Outputs/10;
//    } else if (label === 'Output') {
//      retVal = node.data.m_Value / 1000000000
    }
	return retVal
};

function getCorrectType(nodeType) {
  // we'll use the same icon for type projection
  if (nodeType.endsWith('_Projection'))
    return nodeType.substring(0, nodeType.indexOf('_'))
  else
    return nodeType
}

function getColor (label) {
	var retVal = '#556677'

    label = getCorrectType(label)
    
	if (!iconUrls[label]) {
		console.error("Unknown URL for node with label: " + label);
	}
	else {
		retVal = iconUrls[label][1]
		if (retVal == null)
			retVal = '#660044'
	}
	return retVal
};

function getUrl (nodeType) {
  
  nodeType = getCorrectType(nodeType)
  retVal = 'icons/blue.png'
  
  if (!iconUrls[nodeType]) {
    console.error("Unknown URL for node with type: " + nodeType);
  }
  else {
    retVal = iconUrls[nodeType][0]
  }
  return retVal
};

function getNodeData(node) {
  if (node.data == null)
  {
    // request data from the server
    //var qString = 'from ' + node.label + ' where $$ID==' + node.id + ' return *;'
    var urlstring = location.origin+'/objyget/oid/' + node.id + '?';  //Your URL
    //console.log('Sending request: ', urlstring)
    var xhttp = new XMLHttpRequest();
    xhttp.open("GET", urlstring, false); // not async call
    xhttp.setRequestHeader("Content-type", "application/json");
    xhttp.send();
    var response = JSON.parse(xhttp.responseText);
    //console.log('Got response: ', response)
    // update the original node info as well.
    var graphNode = this.sigmaGraph.graph.nodes(node.id)
    if (graphNode != null)
      graphNode.data = response
    node.data = response
  }
  return node.data
}

/*
 * processes attributs of the node for the tooltip 
 */
function getElements(node) {
  var attributes = ToolTipSelectiveAttributes[node.label];
  var data = getNodeData(node);
  var html_string = '';
  for (var prop in data) {
    //console.log("prop; ", prop, " - value: ", data[prop]);
    if (attributes == null || (attributes != null && attributes.includes(prop)))
    {
      var cellValue = data[prop];
      if (['_value', '_inValue', '_outValue'].includes(prop))
      { // adjust the value to bitcoin and not satoshi
        cellValue = cellValue / 100000000.0;
      }
      html_string += '<tr><th>' + prop + "</th><td>" + 
            cellValue + '</td></tr>';
    }
  }
  
  return html_string
}

function isString (obj) {
  return (Object.prototype.toString.call(obj) === '[object String]');
}

function formPattern(patternList, edgeList) {
  var patternString = "";
  var first = true;
  edgeList.forEach(function(edgeElem) {
    // find source
    var sourceNode = patternList[edgeElem.source];
    //var attribute = elem.n.data;
    if (!first){
//      if (sourceNode.edge != null)
//        patternString += "-[:" + sourceNode.edge.attr +"]->";
//      else 
        patternString += "-->";
    } else {
      first = false;
    }
    var paramListString = "";
    var paramListFirst = true;
    sourceNode.paramList.forEach(function (param) {
      var attributeString = attributeToDO(sourceNode.className, param);
      if (attributeString != null) {
        if (!paramListFirst) {
          paramListString += " AND ";
        } else {
          paramListFirst = false;
        }
        paramListString += attributeString;
      }
    });
    patternString += "(:" + sourceNode.className + " { " + paramListString + "})";
  });
  return patternString;
}

/*****
 * Special function to iterate over the pattern collected info and print
 * collected classes
 * 
 * @param {type} collectedInfo
 * @returns {undefined}
 */
function printCollectedInfo(collectedInfo) {
  console.log(collectedInfo.classes);
  if (collectedInfo.next != null)
  {
    console.log(' --> ')
    printInfo(collectedInfo.next);
  }
}

function attributeToDO(className, attr) {
  if (className !== 'Block' && attr.key === 'm_Id')
    return null; // we'll ignore all other m_Id except for block.
  var attrName = attr.key;
  var attrValue = attr.value;
  if (attrName === 'm_Inputs' || attrName === 'm_Outputs')
    attrName = "LENGTH(" + attrName + ")";
  
  if (typeof attrValue === 'string')
    attrValue = '"' + attrValue + '"';

  var attributeString = attrName + ' == ' + attrValue;
  return attributeString;
}

function getDateTime(epoch) {
  // some how DateTime are coming as strings...
  var date = new Date(Number(epoch));
  //console.log("Date: " + date.toISOString());
  var utcString = date.toUTCString();
  return utcString;
}
