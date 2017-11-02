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
        renderer: function (node, template) {
          // The function context is s.graph
          var tip = {
            label: node.label,
            degree: this.degree(node.id),
            id: node.id
          };
          template = getTemplate(node.label);
          var partials = {table_elements: getElements(node)};

          // Returns an HTML string:
          return Mustache.render(template, tip, partials);

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
                '   <div>' +
                '     <input type="text" oid={{id}} id="tag-text" />' +
                '     <input type="button" class="app-btn-small" value="Tag" onclick="doTag()"/>' +
                '   </div>' +
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
