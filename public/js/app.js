/* global DemoMode, DoQuery, Utils */

/**
 * Main app file
 */

var querys = {
  'Q00' : 'match p = (:Transaction {_isCoinBase == true})-->()-->(:Address {_numOutputs > 200}) return p',
  'Q01' : 'from Transaction where _outValue/100000000 >= 1000 return *',
  'Q02' : 'MATCH p = (:Block{_id==0})-[:_transactions]->(:Transaction)' +
            '-[:_outputs]->(:Output)-->(:Address) RETURN p',
  'Q03' : 'MATCH p = (:Block{_id==0})-->(:Transaction)-->(:Output)' +
            '-->(:Address)-->(:Output)-->(:Transaction)-->()' + 
            ' RETURN p',
  'Q04' : 'match p = (:Address {_hash == "1HB5XMLmzFVj8ALj6mfBsbifRoD4miY36v"})' +
              '-->()-->(:Transaction)-->(:Input)-->(:Transaction {_isCoinBase == true}) return p',
  'Q05' : 'MATCH p = (:Transaction {_numInputs==1 and _numOutputs>500})-->()-->() return p',
  'Q06' : 'MATCH p = (:Transaction {_numInputs>200 and _numOutputs==1})-->() return p',
  'Q07' : 'match p = (:Transaction {_isCoinBase == true})-->()-->() return p',
  'Q08' : 'match p = (:Transaction {_numInputs > 100 and _numOutputs > 10})' +
            '-->(:Input)-->(:Transaction {_isCoinBase == true}) return p',
  'Q09' : 'match paths p = (:Transaction {_numInputs == 2 && _numOutputs == 1})\n\
            -[*2..4]->(:Transaction {_numInputs == 2 && _numOutputs == 1})\n\
            -[*1..2]->(:Transaction { _numInputs == 2 && _numOutputs == 1}) return p',
  'Q99' : 'match p = (:Transaction {_isCoinBase == true})-->()-->(:Address {_numOutputs > 200}) return p'
};

//var qboxDefaultText = 'from Address return *';
var qboxDefaultText = querys['Q00'];

function getQuery(queryKey) {
  return querys[queryKey];
}

function writeToStatus(text) {
    var statusText = document.getElementById('statusBox');
    statusText.value += '\n' + text;
    statusText.scrollTop = statusText.scrollHeight;
}

function doInit() {

    var qbox = document.getElementById("qbox");
    if (qbox)
        qbox.value = qboxDefaultText

    // hide labels off buttton
    Utils.eraseElem('labels-off-btn');
    window.showLabels = true;
    Utils.eraseElem('edge-labels-off-btn');
    window.showEdgeLabels = true;

	// hide similarity buttton
	Utils.eraseElem('similar-nodes-btn');
	Utils.eraseElem('select-nodes-btn');
    // hide pattern button
    Utils.eraseElem('similar-nodes-pattern-btn');
    //Utils.eraseElem('select-nodes-pattern-btn');

	// hide all the extra GraphContainers.
	hideOtherGraphContainers();

    // websocket stuff.
    if (!window.WebSocket) {
        content.html($('<p>', {text: 'Sorry, but your browser doesn\'t '
                    + 'support WebSockets.'}));
        input.hide();
        $('span').hide();
    } else {
        //var ws = new WebSocket(host+"/query");
        window.ws = null;
        window.wsReady = false;
    }

    // Initialize the FullScreen plugin with a button:
    sigma.plugins.fullScreen({
        container: 'workContainer',
        btnId: 'graph-btn'
    });

    DoQuery.init();
}

// add onClick for th eimages.


function doQuery() {
    var queryBox = getQueryBox();
    //Utils.ratifyElem('table-btn')
    DoQuery.execute('graphContainer', queryBox.value);
}

function getQueryBox() {
    return document.getElementById("qbox");
}

function getMaxResults() {
    var elem = document.getElementById("max-results");
    var maxResults = elem.value;
    return maxResults;
}

function getLocateButton() {
    return document.getElementById('locate-btn');
}

function getResetViewButton() {
    return document.getElementById('reset-view-btn');
}

function getTableViewButton() {
    return document.getElementById('table-btn');
}

function doResetView() {

    // DoQuery.accountList.selectedIndex = 0;
    // DoQuery.basketList.selectedIndex = 0;
    // DoQuery.serviceList.selectedIndex = 0;
    // DoQuery.firmList.selectedIndex = 0;

    if (DoQuery.locate)
        DoQuery.locate.center(DoQuery.locateZoomDef);
}

function doLayout1View() {
  DoQuery.currentLayout = DoQuery.doForceLayout;
  DoQuery.currentLayout();
}

function doLayout2View() {
  DoQuery.currentLayout = DoQuery.doNicerLayout;
  DoQuery.currentLayout();
}

function doLayout3View() {
  DoQuery.currentLayout = DoQuery.doTreeLayout;
  DoQuery.currentLayout();
}

function toggleModelDisplay() {
    Utils.toggle('model-graph')
}

function toggleTimeControl() {
    Utils.toggle('time-control')
}

function doShowResultsTable() {
    // showing the results table.
}

function toggleShowLabels() {
  if (window.showLabels == false)
  {
    // show the on and remove the off
    Utils.eraseElem('labels-off-btn')
    Utils.ratifyElem('labels-on-btn')
    window.showLabels = true;
  }
  else
  {
    Utils.eraseElem('labels-on-btn')
    Utils.ratifyElem('labels-off-btn')
    window.showLabels = false;
  }

  if (window.sigmaGraph != null)
  {
    window.sigmaGraph.settings({drawLabels: window.showLabels});
    // Refresh the graph to see the changes
    window.sigmaGraph.refresh();
  }
}

function toggleShowEdgeLabels() {
  if (window.showEdgeLabels == false)
  {
    // show the on and remove the off
    Utils.eraseElem('edge-labels-off-btn')
    Utils.ratifyElem('edge-labels-on-btn')
    window.showEdgeLabels = true;
  }
  else
  {
    Utils.eraseElem('edge-labels-on-btn')
    Utils.ratifyElem('edge-labels-off-btn')
    window.showEdgeLabels = false;
  }

  if (window.sigmaGraph != null)
  {
    window.sigmaGraph.settings({drawEdgeLabels: window.showEdgeLabels});
    // Refresh the graph to see the changes
    window.sigmaGraph.refresh();
  }
}

function doSelectNodes() {
    // activate lasso
    DoQuery.lasso.activate();
    DoQuery.selectedNodes = null;
    Utils.eraseElem('select-nodes-btn')
    Utils.ratifyElem('similar-nodes-btn')
    Utils.ratifyElem('similar-nodes-pattern-btn')
}

/** 
 * used to let GUI does the right thing for selecting one of the
 *  operations for selected nodes.
 * @returns {undefined}
 */
function pickedSelectNodeOperation() {
	Utils.eraseElem('similar-nodes-btn')
	Utils.eraseElem('similar-nodes-pattern-btn')
}

function doNodeSimilarity() {
	if (DoQuery.selectedNodes.length <= 1) // we need at least two nodes.
		return;
      
    pickedSelectNodeOperation();
	DoQuery.lasso.deactivate();
	DoQuery.doSimilarity(DoQuery)
}

//function doPatternSelect() {
//		// activate lasso
//		DoQuery.lasso.activate();
//		DoQuery.selectedNodes = null;
//		Utils.eraseElem('select-nodes-pattern-btn')
//		Utils.ratifyElem('similar-nodes-pattern-btn')
//}

function doPatternSimilarity() {
	if (DoQuery.selectedNodes.length <= 1) // we need at least two nodes.
		return;

    pickedSelectNodeOperation();
    DoQuery.lasso.deactivate();
	var collectedInfos = DoQuery.extractPatternFromNodes()

    var configDiv = document.getElementById('pattern-config-content-internal');
    var createdElements = createPatternGuiNodes(collectedInfos[0], configDiv);

    var modal = document.getElementById('pattern-config');
    modal.style.display = 'block';

    document.getElementById('done-pattern-config').onclick = function() {  
      modal.style.display = 'none';
      // remove the created elements.
      cleanupPatternGuiElements(createdElements);
      console.log('... we will search for pattern...');
      // For now we'll just use the first pattern
      // collectedInfos[0] contain the configured information to construct the
      // DO query.
      DoQuery.doPatternSimilarity(collectedInfos[0])
    };  
}




function hideOtherGraphContainers() {
	Utils.hide('gc1');
	Utils.hide('gc2');
	Utils.hide('gc3');
	Utils.hide('gc4');

	// clearGraphContainer('gc1');
	// clearGraphContainer('gc2');
	// clearGraphContainer('gc3');
	// clearGraphContainer('gc4');
}

function processSelection() {
    var qOption = document.getElementById("qOption");
    var queryString = getQueryBox().value;
    getQueryBox().value = getQuery(qOption.value);
    writeToStatus("Executing: " + qOption.value);
}


function doTag() {
  var elem = document.getElementById("tag-text");
  var oid = elem.getAttribute("oid");
  //console.log("taging object, OID: " + oid + " with", elem.value);
  DoQuery.closeToolTip();
  DoQuery.tag('graphContainer', oid, elem.value);
}

function getClickedStageMenu(event) {
  var stageMenu = document.getElementById('stage-menu');
  console.log('stage menu clicked...')
}
function getAllNodesData() {
  DoQuery.closeToolTip();
  DoQuery.getAllNodesData('graphContainer');
}
