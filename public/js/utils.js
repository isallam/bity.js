
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
    }
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

var blockTemplate = '<div class="arrow"></div>' +
	' <div class="sigma-tooltip-header">{{label}}</div>' +
	'  <div class="sigma-tooltip-body">' +
	'    <table>' +
	'      <tr><th>ID</th> <td>{{data.m_Id}}</td></tr>' +
	'      <tr><th>Version</th> <td>{{data.m_Version}}</td></tr>' +
	'      <tr><th>Time</th> <td>{{data.m_Time}}</td></tr>' +
	'      <tr><th>Hash</th> <td>{{data.m_Hash}}</td></tr>' +
	'      <tr><th># Transactions</th> <td>{{data.m_Transactions}}</td></tr>' +
	'      <tr><th>OID</th> <td>{{id}}</td></tr>' +
	'    </table>' +
	'  </div>' +
	'  <div class="sigma-tooltip-footer">Number of connections: {{degree}}</div>';

var transactionTemplate = '<div class="arrow"></div>' +
	' <div class="sigma-tooltip-header">{{label}}</div>' +
	'  <div class="sigma-tooltip-body">' +
	'    <table>' +
//	'      <tr><th>ID</th> <td>{{data.m_Id}}</td></tr>' +
	'      <tr><th>Hash</th> <td>{{data.m_Hash}}</td></tr>' +
	'      <tr><th># Inputs</th> <td>{{data.m_Inputs}}</td></tr>' +
	'      <tr><th># Outputs</th> <td>{{data.m_Outputs}}</td></tr>' +
	'      <tr><th>OID</th> <td>{{id}}</td></tr>' +
	'    </table>' +
	'  </div>' +
	'  <div class="sigma-tooltip-footer">Number of connections: {{degree}}</div>';

var inputTemplate = '<div class="arrow"></div>' +
	' <div class="sigma-tooltip-header">{{label}}</div>' +
	'  <div class="sigma-tooltip-body">' +
	'    <table>' +
//	'      <tr><th>ID</th> <td>{{data.m_Id}}</td></tr>' +
	'      <tr><th>isCoinBase</th> <td>{{data.m_IsCoinBase}}</td></tr>' +
	'      <tr><th>OID</th> <td>{{id}}</td></tr>' +
	'    </table>' +
	'  </div>' +
	'  <div class="sigma-tooltip-footer">Number of connections: {{degree}}</div>';

var outputTemplate = '<div class="arrow"></div>' +
	' <div class="sigma-tooltip-header">{{label}}</div>' +
	'  <div class="sigma-tooltip-body">' +
	'    <table>' +
//	'      <tr><th>ID</th> <td>{{data.m_Id}}</td></tr>' +
	'      <tr><th>Value</th> <td>{{data.m_Value}}</td></tr>' +
	'      <tr><th>OID</th> <td>{{id}}</td></tr>' +
	'    </table>' +
	'  </div>' +
	'  <div class="sigma-tooltip-footer">Number of connections: {{degree}}</div>';
    
var addressTemplate = '<div class="arrow"></div>' +
	' <div class="sigma-tooltip-header">{{label}}</div>' +
	'  <div class="sigma-tooltip-body">' +
	'    <table>' +
	'      <tr><th>Hash</th> <td>{{data.m_Hash}}</td></tr>' +
	'      <tr><th># Outputs</th> <td>{{data.m_Outputs}}</td></tr>' +
	'      <tr><th>OID</th> <td>{{id}}</td></tr>' +
	'    </table>' +
	'  </div>' +
	'  <div class="sigma-tooltip-footer">Number of connections: {{degree}}</div>';

var tagTemplate = '<div class="arrow"></div>' +
	' <div class="sigma-tooltip-header">{{label}}</div>' +
	'  <div class="sigma-tooltip-body">' +
	'    <table>' +
	'      <tr><th>Label</th> <td>{{data.m_Label}}</td></tr>' +
	'      <tr><th>Ref  </th> <td>{{data.m_Ref}}</td></tr>' +
	'      <tr><th>OID</th> <td>{{id}}</td></tr>' +
	'    </table>' +
	'  </div>' +
	'  <div class="sigma-tooltip-footer">Number of connections: {{degree}}</div>';


function getTemplate(nodeLabel) {
	console.log("Getting template for: ", nodeLabel);

	if (nodeLabel === 'Block')
		return blockTemplate;
	else if (nodeLabel === 'Transaction')
		return transactionTemplate;
	else if (nodeLabel === 'Input')
			return inputTemplate;
	else if (nodeLabel === 'Output')
			return outputTemplate;
    else if (nodeLabel === 'Address')
            return addressTemplate;
    else if (nodeLabel === 'Tag')
            return tagTemplate;
	else
		return simpleTemplate;

	// var nodeTemplate = 		    '<div class="arrow"></div>' +
	// ' <div class="sigma-tooltip-header">{{label}}</div>' +
	// '  <div class="sigma-tooltip-body">' +
	// '    <table>' +
	// '      <tr><th>ID</th> <td>{{data.m_Id}}</td></tr>' +
	// '      <tr><th>OID</th> <td>{{data.oid}}</td></tr>' +
	// '      <tr><th>Edges</th> <td>{{data.edges}}</td></tr>' +
	// '    </table>' +
	// '  </div>' +
	// '  <div class="sigma-tooltip-footer">Number of connections: {{degree}}</div>';

	// return nodeTemplate;

}

function getNodeSize (label) {
	var retVal = 6;

//	if (label === 'Transaction') {
//		retVal = node.data.m_Inputs + node.data.m_Outputs/10;
//	} else if (label === 'Block') {
//      retVal = node.data.m_Transactions/10;
//    } else if (label === 'Address') {
//      retVal = node.data.m_Outputs/10;
//    } else if (label === 'Output') {
//      retVal = node.data.m_Value / 1000000000
//    }
	return retVal
};

function getColor (label) {
	var retVal = '#556677'

	if (!iconUrls[label]) {
		console.error("Unknown URL for node: " + node);
	}
	else {
		retVal = iconUrls[label][1]
		if (retVal == null)
			retVal = '#660044'
	}
	return retVal
};

function getUrl (type) {
  retVal = 'icons/blue.png'
  if (!iconUrls[type]) {
    console.error("Unknown URL for node: " + node);
  }
  else {
    retVal = iconUrls[type][0]
  }
  return retVal
};

function getNodeData(node) {
  if (node.data == null)
  {
    // request data from the server
    //var qString = 'from ' + node.label + ' where $$ID==' + node.id + ' return *;'
    var urlstring = location.origin+'/objyget/oid/' + node.id + '?';  //Your URL
    console.log('Sending request: ', urlstring)
    var xhttp = new XMLHttpRequest();
    xhttp.open("GET", urlstring, false); // not async call
    xhttp.setRequestHeader("Content-type", "application/json");
    xhttp.send();
    var response = JSON.parse(xhttp.responseText);
    console.log('Got response: ', response)
    // update the original node info as well.
    var graphNode = this.sigmaGraph.graph.nodes(node.id)
    if (graphNode != null)
      graphNode.data = response
    node.data = response
  }
  return node.data
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

