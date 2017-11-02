/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/***
 *
 */
function configureTooltip(sigmaGraph) {
  //tooltip stuff..
  var config = {
    node: [{
        show: 'clickNode',
        delay: 500,
//		    show: 'hovers',
        hide: 'hovers',
        hideDelay: 500,
        cssClass: 'sigma-tooltip',
        position: 'top',
        //autoadjust: true,
        //template: this.nodeTemplate,
        // '<div class="arrow"></div>' +
        // ' <div class="sigma-tooltip-header">{{label}}</div>' +
        // '  <div class="sigma-tooltip-body">' +
        // '    <table>' +
        // '      <tr><th>ID</th> <td>{{data.m_Id}}</td></tr>' +
        // '      <tr><th>OID</th> <td>{{data.oid}}</td></tr>' +
        // '      <tr><th>Edges</th> <td>{{data.edges}}</td></tr>' +
        // '    </table>' +
        // '  </div>' +
        // '  <div class="sigma-tooltip-footer">Number of connections: {{degree}}</div>',
        renderer: function (node, template) {
          // The function context is s.graph
          node.degree = this.degree(node.id);
          node.data = getNodeData(node)
          template = getTemplate(node.label);

          // Returns an HTML string:
          return Mustache.render(template, node);

          // Returns a DOM Element:
          //var el = document.createElement('div');
          //return el.innerHTML = Mustache.render(template, node);
        }
      }, {
        show: 'rightClickNode',
        cssClass: 'sigma-tooltip',
        position: 'right',
        template:
                '<div class="arrow"></div>' +
                ' <div class="sigma-tooltip-header">{{label}}</div>' +
                '  <div class="sigma-tooltip-body">' +
                '   <p> Tagging for OID: {{id}} </p>' +
                '   <input type="text" oid={{id}} id="tag-text" />' +
                '   <input type="button" class="app-btn" value="Tag" onclick="doTag()"/>' +
                '  </div>', 
                //' <div class="sigma-tooltip-footer">Number of connections: {{degree}}</div>',
        renderer: function (node, template) {
          console.log('node', node);
          node.degree = this.degree(node.id);
          return Mustache.render(template, node);
        }
      }],
    stage: {
      template:
              '<div class="arrow"></div>' +
              '<div class="sigma-tooltip-header"> Menu </div>'
    }
  };

  // Instanciate the tooltips plugin with a Mustache renderer for node tooltips:
  var tooltips = sigma.plugins.tooltips(sigmaGraph,
          sigmaGraph.renderers[0], config);

//		tooltips.bind('shown', function(event) {
//		  console.log('tooltip shown', event);
//		});
//
//		tooltips.bind('hidden', function(event) {
//		  console.log('tooltip hidden', event);
//		});
  return tooltips;
}
