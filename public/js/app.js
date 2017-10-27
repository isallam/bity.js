/* global DemoMode, DoQuery, Utils */

/**
 * Main app file
 */

var querys = {
  'Q01' : 'from Block where m_Id==99 return *',
  'Q02' : 'MATCH p = (:Block{m_Id==0})-[:m_Transactions]->(:Transaction)' +
            '-[:m_Outputs]->(:Output)-->(:Address) RETURN p',
  'Q03' : 'MATCH p = (:Block{m_Id==0})-->(:Transaction)-->(:Output)' +
            '-->(:Address)-->(:Output)-->(:Transaction)-->(:Input{m_IsCoinBase == false})' + 
            '-->() RETURN p',
  'Q04' : 'match p = (:Address {m_Hash == "1HB5XMLmzFVj8ALj6mfBsbifRoD4miY36v"})' +
              '-->()-->(:Transaction)-->(:Input)-->(:Transaction) return p',
  'Q05' : 'MATCH p = (:Transaction {length(m_Inputs)==1 and length(m_Outputs)>200})-->()-->() return p',
  'Q06' : 'MATCH p = (:Transaction {length(m_Inputs)>200 and length(m_Outputs)==1})-->() return p',
  'Q07' : 'match p = (:Transaction)-->(:Input {m_IsCoinBase == false}) return p',
  'Q08' : 'match p = (:Transaction {length(m_Inputs) > 100 and length(m_Outputs) > 10})' +
            '-->(:Input {m_IsCoinBase == false}) return p'
};

//var qboxDefaultText = 'from Address return *';
var qboxDefaultText = querys['Q07'];

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

    // hide similarity buttton
    //Utils.eraseElem('table-btn');

	// hide similarity buttton
	Utils.eraseElem('similar-nodes-btn');
	Utils.eraseElem('select-nodes-btn');
    // hide pattern button
    Utils.eraseElem('similar-nodes-pattern-btn');
    Utils.eraseElem('select-nodes-pattern-btn');

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

function doShowResultsTable() {
    // showing the results table.
}

function doSelectNodes() {
		// activate lasso
		DoQuery.lasso.activate();
		DoQuery.selectedNodes = null;
		Utils.eraseElem('select-nodes-btn')
		Utils.ratifyElem('similar-nodes-btn')
}

function doNodeSimilarity() {
	if (DoQuery.selectedNodes.length <= 1) // we need at least two nodes.
		return;

	Utils.eraseElem('similar-nodes-btn')
	DoQuery.lasso.deactivate();
	DoQuery.doSimilarity(DoQuery)
}

function doPatternSelect() {
		// activate lasso
		DoQuery.lasso.activate();
		DoQuery.selectedNodes = null;
		Utils.eraseElem('select-nodes-pattern-btn')
		Utils.ratifyElem('similar-nodes-pattern-btn')
}

function doPatternSimilarity() {
	if (DoQuery.selectedNodes.length <= 1) // we need at least two nodes.
		return;

	Utils.eraseElem('similar-nodes-pattern-btn')
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
  console.log("taging object, OID: " + oid + " with", elem.value);
  DoQuery.tag('graphContainer', oid, elem.value);
}

