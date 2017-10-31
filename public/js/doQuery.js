var DoQuery = {
    sigmaGraph: {},
    graphContainerName: '',
    locat: {},

    // accountList: {},
    // basketList: {},
    // serviceList: {},
    // firmList: {},
    inSimilarityState: false,
    contextList: [],
    init: function ()
    {
        // this.accountList = document.getElementById('accountList');
        // this.basketList = document.getElementById('basketList');
        // this.serviceList = document.getElementById('serviceList');
        // this.firmList = document.getElementById('firmList');

    },
    locateNode: function (e) {
        var nid = e.target[e.target.selectedIndex].nodeId;
        if (nid == '') {
            e.target.locate.center(1);
        } else {
            e.target.locate.nodes(nid);
        }
    },

    configureLocate: function ()
    {
        var conf = {
            animation: {
                node: {duration: 800},
                edge: {duration: 800},
                center: {duration: 300}
            },
            //focusOut: true,
            zoomDef: 1
        };


        this.locateZoomDef = conf.zoomDef;

        this.locate = sigma.plugins.locate(this.sigmaGraph, conf);

        this.locate.setPadding({
            // top:250,
            // bottom: 250,
            right: 250,
            // left:250
        });


        // this.accountList.addEventListener("change", this.locateNode);
        // this.basketList.addEventListener("change", this.locateNode);
        // this.serviceList.addEventListener("change", this.locateNode);
        // this.firmList.addEventListener("change", this.locateNode);
        //
        // this.accountList.locate = this.locate
        // this.basketList.locate = this.locate
        // this.serviceList.locate = this.locate
        // this.firmList.locate = this.locate

    },
    clearLocateLists: function ()
    {
        // // clear account list
        // Utils.removeSelectOptions(this.accountList)
        // Utils.removeSelectOptions(this.basketList)
        // Utils.removeSelectOptions(this.serviceList)
        // Utils.removeSelectOptions(this.firmList)
    },
    configureLasso: function (s) {
        // lasso configuration and setup
        var lasso = new sigma.plugins.lasso(s, s.renderers[0],
                {
                    'strockStyle': 'black',
                    'lineWidth': 2,
                    'fillWhileDrawing': true,
                    'fillStyle': 'rgba(41,41,41,0.2)',
                    'cursor': 'crosshair'
                }
        );

        lasso.bind('selectedNodes', function (event) {

            // pick the selected nodes.
            var nodes = event.data;
            //console.log('selectedNodes: ', nodes);
            var s = event.target.sigmaInstance;
            s.graph.nodes().forEach(function (node) {
                node.color = getColor(node);
                node.size = 5;
            })
            nodes.forEach(function (node) {
                node.color = 'red';
                node.size = 10;
            })

            s.refresh();
            s.controller.selectedNodes = nodes;
        });
        return lasso;
    },
    /**
     * execut()
     * @param container
     * @param doStatement
     */
    execute: function (container, doStatement)
    {

        // more sure to exit the demo mode.
        if (doStatement === null || doStatement === '')
        {
            writeToStatus("ERROR: Invalid query statement. " + doStatement);
            return;
        }
        this.graphContainerName = container

        //clearGraphContainer(container);
        // clear graph container.
        var sigmaGraphRef = this.contextList[container];
        if (sigmaGraphRef) {
            sigmaGraphRef.graph.clear();
            sigmaGraphRef.refresh();
        }
        for (var key in this.contextList) {
          var elem = this.contextList[key];
          elem.graph.clear();
          elem.refresh();
        }
		hideOtherGraphContainers();

      Utils.show(container);


        var maxResults = getMaxResults();
        //console.log("using max-results: " + maxResults);

        writeToStatus("Executing query: " + doStatement)
        writeToStatus("... using MaxResults: " + maxResults);

        //this.clearLocateLists()
        var msg = {"qType": "DOQuery",
            "qContext": this.graphContainerName,
            "doStatement": doStatement,
            "maxResult": Number(maxResults),
            "verbose": 2};
        WebSocketHandler.sendMessage(msg, this)
        this.inQuery = true;

        if (sigmaGraphRef)
            return; // nothing to configure and create.

        window.sigmaGraph = this.sigmaGraph = new sigma({
            //graph: g,
            //container: this.graphContainerName,
            renderer: {
                container: this.graphContainerName,
                type: 'canvas'
            },
            settings: graphSettings
        });

        this.sigmaGraph.controller = this
        // key the sigmaGraph with the container.
        this.contextList[this.graphContainerName] = this.sigmaGraph;

        this.sigmaGraph.bind('doubleClickNode', function (e) {
            e.target.controller.expandNode(e.data.node.id,
                    e.target.controller);
            //console.log("DBL_CLK:", e.type, e.data.node.id, e.data.captor);
        });

        // Remove duplicates in a specified array.
        // See http://stackoverflow.com/a/1584370
        function arrayUnique(array) {
            var a = array.concat();
            for (var i = 0; i < a.length; ++i) {
                for (var j = i + 1; j < a.length; ++j) {
                    if (a[i] === a[j])
                        a.splice(j--, 1);
                }
            }
            return a;
        }
        ;

        function renderHalo() {
            this.sigmaGraph.renderers[0].halo({
                nodes: this.sigmaGraph.graph.nodes()
            });
        }

        // Bind the events:
//		s.bind('clickNode doubleClickNode rightClickNode', function(e) {
//		  console.log(e.type, e.data.node.label, e.data.captor);
//		});
//		s.bind('clickEdge doubleClickEdge rightClickEdge', function(e) {
//		  console.log(e.type, e.data.edge, e.data.captor);
//		});
        // the following to clear the halo.
        this.sigmaGraph.bind('clickStage doubleClickStage rightClickStage', function (e) {
            console.log(e.type, e.data.captor);
            e.target.renderers[0].halo({
                nodes: {},
                edges: {}
            });

        });

        this.sigmaGraph.bind('hovers', function (e) {
            //console.log(e.type, e.data.captor, e.data);

            var adjacentNodes = [],
                    adjacentEdges = [];

            if (!e.data.enter.nodes.length)
                return;

            // Get adjacent nodes:
            e.data.enter.nodes.forEach(function (node) {
                adjacentNodes = adjacentNodes.concat(window.sigmaGraph.graph.adjacentNodes(node.id));
            });

            // Add hovered nodes to the array and remove duplicates:
            adjacentNodes = arrayUnique(adjacentNodes.concat(e.data.enter.nodes));

            // Get adjacent edges:
            e.data.enter.nodes.forEach(function (node) {
                adjacentEdges = adjacentEdges.concat(window.sigmaGraph.graph.adjacentEdges(node.id));
            });

            // Remove duplicates:
            adjacentEdges = arrayUnique(adjacentEdges);

            // Render halo:
            window.sigmaGraph.renderers[0].halo({
                nodes: adjacentNodes,
                edges: adjacentEdges
            });

        });

         //Configure the ForceLink algorithm:
         var fa = sigma.layouts.configForceLink(this.sigmaGraph, {
           worker: true,
         	//barrnsHutOptimizer:false,
           autoStop: true,
           background: true,
         	scalingRatio: 2,
         	gravity: 1.8,
           	easing: 'cubicInOut',
         	//easing: 'quadraticInOut'
            randomize: 'locally'
         });
         
        
         // Bind the events:
         fa.bind('start stop', function(e) {
           console.log(e.type);
         });

        // Configure the Fruchterman-Reingold algorithm:
        var frListener = sigma.layouts.fruchtermanReingold.configure(this.sigmaGraph, {
            gravity: 1.8,
            iterations: 200, //100, //500,
            easing: 'quadraticInOut', //'cubicInOut',
            duration: 100 //800
        });

        // Bind the events:
        frListener.bind('start stop interpolate', function (e) {
            console.log(e.type);
        });

        // configure the Dagre lyoutout
        var dgListener = sigma.layouts.dagre.configure(this.sigmaGraph, {
          rankdir: 'TB',
          easing: 'quadraticInOut',
          duration: 800
        });

        // set the current layout to the force one
        this.currentLayout = this.doForceLayout;

        this.lasso = this.configureLasso(this.sigmaGraph);
        this.configureLocate();
        configureTooltip(this.sigmaGraph);

        window.activeState = activeState = sigma.plugins.activeState(this.sigmaGraph);

        // // Initialize the FullScreen plugin with a button:
        // // TBD... perhaps we can move this to a global location.
        //   sigma.plugins.fullScreen({
        //     container: this.graphContainerName,
        //     btnId : 'graph-btn'
        //   });
        
        // configure drag
        var dragListener = sigma.plugins.dragNodes(this.sigmaGraph, 
          this.sigmaGraph.renderers[0], activeState);
        dragListener.bind('startdrag', function(event) {
          window.activeState.addNodes(event.data.node.id);
          //window.activeState.addNeighbors();
          console.log(event);
        });
        dragListener.bind('drag', function(event) {
          console.log(event);
        });
        dragListener.bind('drop', function(event) {
          console.log(event);
        });
        dragListener.bind('dragend', function(event) {
          window.activeState.dropNodes();
          console.log(event);
        });
    },
    
    doForceLayout: function() {
        sigma.layouts.startForceLink();
        this.currentLayout = this.doForceLayout
    },
    
    doNicerLayout: function() {
        // Start the Fruchterman-Reingold algorithm:
        sigma.layouts.fruchtermanReingold.start(window.sigmaGraph);
        this.currentLayout = this.doNicerLayout
    },
    
    doTreeLayout: function() {
      sigma.layouts.dagre.start(window.sigmaGraph);
        this.currentLayout = this.doTreeLayout
    },

  /***
     *
     * @param nodeId
     * @param handler
     */
    expandNode: function (nodeId, handler) {
        writeToStatus("Expanding node: " + nodeId);
        var maxResults = getMaxResults();
        var msg = {"qContext": this.graphContainerName,
            "qType": "getEdges", "objRef": nodeId,
            "maxResult": Number(maxResults),
            "verbose": 2};
        WebSocketHandler.sendMessage(msg, handler);
        document.body.style.cursor = 'wait';
        // this.expandNodeId = nodeId;
    },
    /***
     * allow us to do any post query stuff
     * @param context
     */
    executeCompleted: function (context) {

        console.log("EXECUTE Completed!!!");

        document.body.style.cursor = 'auto';

        var sGraph = this.contextList[context];

        // Start the Fruchterman-Reingold algorithm:
        //sigma.layouts.fruchtermanReingold.start(sGraph);
        // 
  //        sGraph.startForceAtlas2({worker:true})
  //        setTimeout(function() {
  //            sGraph.stopForceAtlas2();
  //            console.log("ForceAtlas2 stopped")
  //        }, 2000);
        this.currentLayout();
          
        this.clearLocateLists();

        var resultsTable = document.getElementById('resultsTable');
        if (resultsTable != null)
        {
	/***
          // clear the table first.
          while(resultsTable.rows.length > 1)
          {
              resultsTable.deleteRow(1);
          }

          // pick the top 10 communications based on emails. the table with the top communication.
          var items = [];
          var maxItems = 10;
          var minCount = 99999999;
  //        var maxEmailCount = Math.MIN_VALUE;

          sGraph.graph.nodes().forEach(function (n) {
              if (n.label == 'Transaction') {
                  if (items.length < maxItems) {
                      items.push(n);
                      minCount = Math.min(minCount, n.data.m_Outputs);
  //                    maxEmailCount = max(maxEmailCount, n.data.emails);
                  }
                  else
                  {
                      if (n.data.m_Outputs > minCount) {
                          items.push(n);
                      }

                  }
                  items.sort(function(a, b) {
                     return (b.data.m_Outputs - a.data.m_Outputs);
                  });
                  if (items.length > maxItems)
                      items.pop(); // remove the last smaller item.
                  //console.log("Array: ", emails);
              }
          });
          if (items.length >0) {
              items.forEach(function(n, i) {
                  var hash = n.data.m_Hash;
                  var outputs = n.data.m_Outputs;
                  var inputs = n.data.m_Inputs;

                  var tr = resultsTable.insertRow(1);
                  var td = tr.insertCell(0);
                  td.innerHTML = hash;
                  td = tr.insertCell(1);
                  td.innerHTML = inputs;
                  td = tr.insertCell(2);
                  td.innerHTML = outputs;
              });
          }
	***/
        }

        // find out if we have more than one transaction in the graph.
        // 
        var numTransactions = 0;
        var sGraph = this.contextList[context];

        sGraph.graph.nodes().forEach(function (n) {
          if (n.label == 'Transaction')
          {
            numTransactions += 1;
          }
          return numTransactions >= 2;
        });

        console.log("numTrx: ", numTransactions);
          // only activate the select-nodes-btn if we have more than 1 transction.
        if (numTransactions > 1) {
            Utils.ratifyElem('select-nodes-btn')
        } else {
            Utils.eraseElem('select-nodes-btn')
        }

        if (sGraph.graph.nodes().length > 2)
          Utils.ratifyElem('select-nodes-pattern-btn');

        this.inQuery = false;

    },
    
    /**
     * tag()
     * @param container
     * @param doStatement
     */
    tag: function (containerName, oid, tagText)
    {
        this.containerName = containerName;
        
        var doStatement = "Create @Tag {m_Label = \"" + 
                              tagText + "\", m_Ref = " + oid + "}";

        writeToStatus("Tagging using DO: " + doStatement)

        //this.clearLocateLists()
        var msg = {"qType": "DOUpdate",
            "qContext": this.containerName,
            "doStatement": doStatement,
            "objRef": oid,
            "verbose": 2};
        WebSocketHandler.sendMessage(msg, this);
        document.body.style.cursor = 'wait';
        this.inQuery = true;
    },

    
    /***
     * Process the results form the server.
     *
     * @param qResult
     */
    processResult: function (context, qResult)
    {
        //console.log(".... I'll handle your data:", qResult);
        //console.log(".... processsing for context:", context);

        var sGraph = this.contextList[context]

        if (qResult.__class__ == '_Projection')
        {
          var elemArray = qResult.p
          for (var i = 0; i < elemArray.length; i++ ) {
            var elemObj = elemArray[i]
            var fromId = elemObj.from
            var fromClass = elemObj.fromClass
            if (sGraph.graph.nodes(fromId) == null) {
              sGraph.graph.addNode( {
                id: fromId,
                label: fromClass,
                x: Math.random(),
                y: Math.random(),
                level: 3,
                size: getNodeSize(fromClass), //Math.random(),
                color: getColor(fromClass), //'#666',
                image: {
                    url: getUrl(fromClass),
                    // scale/clip are ratio values applied on top of 'size'
                    scale: 1.2,
                    clip: 1.0,
                },
                data: null
              })
            }
            var toId = elemObj.to
            var toClass = elemObj.toClass
            if (sGraph.graph.nodes(toId) == null) {
              sGraph.graph.addNode({
                id: toId,
                label: toClass,
                x: Math.random(),
                y: Math.random(),
                level: 3,
                size: getNodeSize(toClass), //Math.random(),
                color: getColor(toClass), //'#666',
                image: {
                    url: getUrl(toClass),
                    // scale/clip are ratio values applied on top of 'size'
                    scale: 1.2,
                    clip: 1.0,
                },
                data: null              
              })
            }
            var edgeAttribute = elemObj.attribute
            var edgeId = fromId + ":" + toId
            if (sGraph.graph.edges(edgeId) == null) {
              sGraph.graph.addEdge({
                  id: edgeId,
                  source: fromId,
                  target: toId,
                  size: 0.4,
                  //level: 2,
                  type: 'curve',
                  // color: getEdgeColor(sGraph.graph, qResult.edge.source),
                  hover_color: '#000'
              })
            }
          }
        }
        if (qResult.nodes != null) // multiple nodes.
        {
            for (i = 0; i < qResult.nodes.length; i++) {
                var node = qResult.nodes[i];
                if (sGraph.graph.nodes(node.id) == null) {
                    sGraph.graph.addNode({
                        id: node.id,
                        label: node.label,
                        x: Math.random(),
                        y: Math.random(),
                        level: 3,
                        size: getNodeSize(node), //Math.random(),
                        color: getColor(node), //'#666',
                        image: {
                            url: getUrl(node.label),
                            // scale/clip are ratio values applied on top of 'size'
                            scale: 1.2,
                            clip: 1.0,
                        },
                        data: node.data
                    })
                }
            }
        }

        if (qResult.edges != null) // multiple edges.
        {
            for (i = 0; i < qResult.edges.length; i++) {
                var edge = qResult.edges[i];
                if (sGraph.graph.edges(edge.id) == null) {
                    sGraph.graph.addEdge({
                        id: edge.id,
                        source: edge.source,
                        target: edge.target,
                        label: edge.label,
                        size: 1,
                        level: 2,
                        type: 'curvedArrow',
                        // color: getEdgeColor(sGraph.graph, qResult.edge.source),
                        hover_color: '#000'
                    });
                }
            }
        }
        if (qResult.status != null) // display status in the status window
        {
            // this is a hack to allow for similarity results to show on the windows.
            if (this.inSimilarityState)
            {
                if (qResult.status.includes("Sim Index"))
                {
                    var gcHeader = document.getElementById(qResult.context + "-header")
                    if (gcHeader)
                        gcHeader.innerHTML += " <small>" + qResult.status + "</small>";

                }
            }
            writeToStatus(qResult.status);
        }
        sGraph.refresh()

    },
    /****
     *
     * @param controller
     */
    doSimilarity: function (controller) {

        // // TBD... this function can be written better!!!!! IS:
         this.inSimilarityState = true;
        
         objList = [];
         controller.selectedNodes.forEach(function (n) {
            if(n.label === 'Transaction') {
             objList.push(n.id);
           }
         })
         writeToStatus("Similarity for: " + objList.toString());
         if (objList.length  < 2)
           writeToStatus(" Not enough data to do Similarity...");
        
         Utils.hide('graphContainer');
        
         var config1 = {
             element: 'gc1',
             top: '50%',
             bottom: '2%',
             left: '50%',
             right: '10px',
             // no objId1 (since this is a reference graph)
             objId2: objList[0] // this will give us the graph.
         }
         controller.prepGraphForSimilarity(config1);
        
         var config2 = {
             element: 'gc2',
             top: '2%',
             bottom: '50%',
             left: '10px',
             right: '50%',
             objId1: objList[0],
             objId2: objList[1]
         }
        
         controller.prepGraphForSimilarity(config2);
         controller.sendSimilarityRequest(config2);
        
         if (objList.length > 2) {
             var config3 = {
                 element: 'gc3',
                 top: '2%',
                 bottom: '50%',
                 left: '50%',
                 right: '10px',
                 objId1: objList[0],
                 objId2: objList[2],
             }
        
             controller.prepGraphForSimilarity(config3);
             controller.sendSimilarityRequest(config3);
         }
         else {
           // reset the header
            var gc = document.getElementById('gc3');
            var gcHeader = document.getElementById('gc3' + "-header");
            gcHeader.innerHTML = "[]";
         }
        
         if (objList.length > 3) {
        
             var config4 = {
                 element: 'gc4',
                 top: '50%',
                 bottom: '2%',
                 left: '10px',
                 right: '50%',
                 objId1: objList[0],
                 objId2: objList[3],
             }
        
             controller.prepGraphForSimilarity(config4);
             controller.sendSimilarityRequest(config4);
         }
         else {
           // reset the header
            var gc = document.getElementById('gc4');
            var gcHeader = document.getElementById('gc4' + "-header");
            gcHeader.innerHTML = "[]";
         }
         
         // get the graphs and display them
         controller.getGraph(config1);
        
         controller.getGraph(config2);
        
         if (objList.length > 2) {
             controller.getGraph(config3);
         }
         if (objList.length > 3) {
             controller.getGraph(config4);
         }
        
    },
    
    /****
     *
     * 
     */
    extractPatternFromNodes: function () {
        // // TBD... this function can be written better!!!!! IS:
         this.inSimilarityState = true;
         
         var nodeList = {};
         this.selectedNodes.forEach(function (n) {
            var data = n.data;
            nodeList[n.id] = {id: n.id, className: n.label, attributes: data};
        });
        //console.log(nodeList);
        var pathList = getPaths(nodeList, this.sigmaGraph);
        //console.log("PathList: ", pathList);
        var collectedInfos = processPaths(pathList);
//        console.log("CollecteInfos: ", collectedInfos);
//        collectedInfos.forEach(function(info) {
//          console.log("ELEM:")
//          printCollectedInfo(info);
//        });
//        var patternString = ""//formPattern(nodeList, pathList);
         
        //writeToStatus("Pattern: " + patternString);
        //var queryString = "Match p = " + patternString + " return p;";
        //getQueryBox().value = queryString;
        
        return collectedInfos;
    },
    
    doPatternSimilarity : function(collectedInfo) {
      var doStatement = null;
      
      while(collectedInfo != null) {
        var doComponent = costructDoComponent(collectedInfo)
        if (doStatement === null)
          doStatement = "Match p = " + doComponent;
        else
          doStatement = doStatement + "-->" + doComponent;
        
        collectedInfo = collectedInfo.next;
      }
      
      if (doStatement !== null)
        doStatement = doStatement + " return p;";
      
      console.log("DO: ", doStatement);
//      execute('graphContainer', doStatement);
      getQueryBox().value = doStatement;

    },
    
    prepGraphForSimilarity: function (config) {
    
         var gc1 = document.getElementById(config.element);
         var gc1Header = document.getElementById(config.element + "-header")
         gc1Header.innerHTML = "[" + config.objId2 + "]";
         // gc1.style.top = config.top;
         // gc1.style.bottom = config.bottom;
         // gc1.style.left = config.left;
         // gc1.style.right = config.right;
         // gc1.style.position = 'absolute'
         // gc1.style.background = 'white'
    
         // find or create the first sigma graph object.
         var s1 = this.contextList[config.element];
         if (s1) {
             // clear the old graph
             s1.graph.clear();
         } else {
             s1 = new sigma({
                 renderer: {
                     container: gc1,
                     type: 'canvas'
                 },
                 settings: graphSettings
             });
    
             // Configure the Fruchterman-Reingold algorithm:
             var frListener = sigma.layouts.fruchtermanReingold.configure(s1, {
                 iterations: 500,
                 easing: 'quadraticInOut',
                 duration: 800
             });
    
             // regisgter with contextList.
             this.contextList[config.element] = s1;
         }
     },
     
    /***
     * // send request to get the graph
     *
     * @param config
     * @returns
     */
     getGraph: function (config) {
         var maxResults = getMaxResults();
         // for Transaction objId2 is actually an OID.
         var queryString1 = 'Match p=(:Transaction{$$this_reference== ' + config.objId2 + '})' +
                 '-->() return p';
         // until we fix the performance of the query above.
//         var msg1 = {
//             "qType": "DOQuery",
//             "qContext": config.element,
//             "doStatement": queryString1,
//             "maxResult": Number(maxResults),
//             "verbose": 2
//         };
        var msg1 = {
            "qType": "getEdges", 
            "qContext": config.element,
            "objRef": config.objId2,
            "maxResult": Number(maxResults),
            "verbose": 2};
    
         WebSocketHandler.sendMessage(msg1, this /*controller*/);
         writeToStatus("Requesting Graph for: " + config.objId2);
         Utils.show(config.element);
     },
    
    /***
     * executeSimilarityRequest
     *
     */
     sendSimilarityRequest: function (config) {
    
         // send the request.
         var maxResults = getMaxResults();
    
         if (config.objId1 != null) // this is areference graph, don't do similarity
         {
             var msg1 = {
                 "qContext": config.element,
                 "qType": "similarity", "objId1": config.objId1,
                 "objId2": config.objId2,
                 "maxResult": Number(maxResults),
                 "verbose": 2
             };
             WebSocketHandler.sendMessage(msg1, this /*controller*/);
         }
     }
    
}
