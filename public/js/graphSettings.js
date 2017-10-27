/**
 * Created by ibrahim on 9/22/16.
 */
var graphSettings = {
    nodeHaloColor: '#ffffcc', //'#ecf0f1',
    edgeHaloColor: '#ffffcc', //'#ecf0f1',
    nodeHaloSize: 10,
    edgeHaloSize: 8,
    
    minEdgeSize: 0.5,
    maxEdgeSize: 1,
    minNodeSize: 2,
    maxNodeSize: 8,
//	edgeColor: 'default', // we are using source edge color.
//			    defaultEdgeColor: 'red',
//			    animationsTime: 5000,
//			    drawLabels: true,
//			    //scalingMode: 'outside',
    labelColor: 'node',
    batchEdgesDrawing: true,
    hideEdgesOnMove: false,
    minArrowSize: 1,
    defaultEdgeArrow: 'source',
    drawEdgeLabel: true,
    edgeLabelSize: 'proportional',
//			    sideMargin: 2,
    nodeBorderSize: 2,
    //labelSize: 'proportional',
    defaultNodeBorderColor: '#fff',
    defaultNodeHoverBorderColor: '#fff',

    nodeActiveColor: 'default',
    nodeActiveBorderSize: 2,
    defaultNodeActiveBorderColor: '#fff',
    nodeActiveOuterBorderSize: 3,
    nodeActiveBorderColor: 'default',
    defaultNodeActiveOuterBorderColor: 'rgb(236, 81, 72)',

    zoomMin: 0.2,
    zoomMax: 3,

    shortLabelsOnHover: true,    // enable the short label display mode
    spriteSheetResolution: 2048, // resolution of the sprite sheet square
    spriteSheetMaxSprites: 8,    // number max of sprites

    // try to prevent zoon on double clicking...
    //doubleClickEnabled: false
    doubleClickZoomingRatio: 1.2,
};

var iconUrls = {
    'Block'       : ['icons/bank.png', '#4C6A92'],
    'Transaction' : ['icons/bitcoin.png', '#e2641f'],
    'Input'       : ['icons/graph-icons/TransactionEvent.png', '#F7CAC9'],
    'Output'      : ['icons/graph-icons/TransactionEvent.png', '#cc0c29'],
    'Address'     : ['icons/address.png', '#229954'],
    'Tag'         : ['icons/graph-icons/Task.png', '#838487']
};

var iconUrls_theOther = {'Account'  : ['icons/graph-icons/Account.png', '#4C6A92'], // 0059FF (brighter)
    'Basket'   : ['icons/graph-icons/Basket.png', '#FFA500'],
    'Firm'     : ['icons/graph-icons/Firm.png', '#838487'],
    'Security' : ['icons/graph-icons/Security.png', '#229954'],
    'Sender'   : ['icons/graph-icons/Sender.png', '#92B6D5'],
    'Service'  : ['icons/graph-icons/Service.png', '#7B241C'],
    'Task'     : ['icons/graph-icons/Task.png', '#A93226'],
    'TimeSegment'               : ['icons/graph-icons/TimeSegment.png', '#F7CAC9'],
    'TimeFragment'              : ['icons/graph-icons/TimeSegment.png', '#DFCFBE'],
    'TransactionEvent'          : ['icons/graph-icons/TransactionEvent.png', '#884EA0'],
    'Transaction'               : ['icons/graph-icons/transaction_order.png', '#D8AE47'],
    'Transaction_cancel_replace': ['icons/graph-icons/transaction_cancel_replace.png', '#F7786B'],
    'Transaction_cancel'        : ['icons/graph-icons/transaction_cancel.png', '#FAE03C'],
    'Transaction_execution'     : ['icons/graph-icons/transaction_execution.png', '#79C753'],
    'Transaction_order'         : ['icons/graph-icons/transaction_order.png', '#D8AE47' ]

};
