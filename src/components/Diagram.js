import React, { Component } from 'react';
import { jsPlumb } from 'jsplumb';

const confirm = (data) => {
  return true;
};

class Diagram extends Component {
  componentDidMount () {
    const {model} = this.props;

    this.loadDiagram(model);
  }

  buildCardinalityTag(component, model, useFrom){
    const {sourceId, targetId} = component;
    const relation = model.relations.find(x => x.from.ref === sourceId && x.to.ref === targetId);

    const elem = document.createElement('div');
    elem.classList.add('tag', 'z-10');
    elem.innerHTML = `<p>${useFrom ? relation.from.cardinality : relation.to.cardinality}</p>`;
    return elem;
  }


  loadDiagram(model){
    const anchorPoints = [
      [0.2, 0, 0, 0, 0, 0],
      [0.5, 0, 0, 0, 0, 0],
      [0.8, 0, 0, 0, 0, 0],

      [0, 0.2, 0, 0, 0, 0],
      [0, 0.5, 0, 0, 0, 0],
      [0, 0.8, 0, 0, 0, 0],

      [1, 0.2, 0, 0, 0, 0],
      [1, 0.5, 0, 0, 0, 0],
      [1, 0.8, 0, 0, 0, 0],

      [0.2, 1, 0, 0, 0, 0],
      [0.5, 1, 0, 0, 0, 0],
      [0.8, 1, 0, 0, 0, 0]
    ];

    jsPlumb.ready(() => {
      var lineColor = '#30364c',
        exampleDropOptions = {
          tolerance: 'touch',
          hoverClass: 'dropHover',
          activeClass: 'dragActive'
        },
        connector = ['Bezier', {cssClass: 'connectorClass', hoverClass: 'connectorHoverClass'}],
        connectorStyle = {
          strokeWidth: 3,
          stroke: lineColor
        },
        hoverStyle = {
          stroke: '#449999'
        },
        overlays = [
          ['Custom', {
            create: component => this.buildCardinalityTag(component,model, true),
            location: 0.1,
            id: 'fromCardinalityOverlay'
          }],
          ['Custom', {
            create: component => this.buildCardinalityTag(component,model, false),
            location: 0.9,
            id: 'toCardinalityOverlay'
          }]
        ],
        endpoint = ['Dot', {cssClass: 'endpointClass', radius: 5, hoverClass: 'endpointHoverClass'}],
        endpointStyle = {fill: lineColor},
        anEndpoint = {
          endpoint: endpoint,
          paintStyle: endpointStyle,
          hoverPaintStyle: {fill: '#449999'},
          isSource: true,
          isTarget: true,
          maxConnections: -1,
          connector: connector,
          connectorStyle: connectorStyle,
          connectorHoverStyle: hoverStyle,
          connectorOverlays: overlays
        };

      var instance = jsPlumb.getInstance({
        DragOptions: {cursor: 'pointer', zIndex: 1},
        Container: 'canvas'
      });

      instance.batch(function () {
        const connections = model.relations.reduce((acc, cur) => {
          if (!acc.hasOwnProperty(cur.from.ref)) {
            acc[cur.from.ref] = [];
          }

          acc[cur.from.ref] = [...acc[cur.from.ref], cur.to.ref];
          return acc;
        }, {});

        var endpoints = {};
        // ask jsPlumb for a selector for the window class
        var divsWithWindowClass = jsPlumb.getSelector('.dynamic-demo .window');
        // add endpoints to all of these - one for source, and one for target, configured so they don't sit
        // on top of each other.
        for (var i = 0; i < divsWithWindowClass.length; i++) {
          var sourceId = instance.getId(divsWithWindowClass[i]);

          if(connections.hasOwnProperty(sourceId)){
            const connected = connections[sourceId];
            for(const targetId of connected){
              const sourceEndpoint = instance.addEndpoint(sourceId, anEndpoint, {anchor: anchorPoints})
              const targetEndpoint = instance.addEndpoint(targetId, anEndpoint, {anchor: anchorPoints})

              instance.connect({
                source: sourceEndpoint,
                target: targetEndpoint
              })
            }
          }
        }


        // bind click listener; delete connections on click
        instance.bind('click', function (conn) {
          instance.detach(conn);
        });

        // bind beforeDetach interceptor: will be fired when the click handler above calls detach, and the user
        // will be prompted to confirm deletion.
        instance.bind('beforeDetach', function (conn) {
          return confirm('Delete connection?');
        });

        instance.draggable(divsWithWindowClass);

        jsPlumb.fire('jsPlumbDemoLoaded', instance);
      });
    });
  }


  calculateScalingFactors (model) {
    const diagramWindow = document.querySelector('#diagram-window');

    const canvasWidth = diagramWindow.clientWidth;
    const canvasHeight = diagramWindow.clientHeight;

    const leftX = Math.min(...model.entities.map(entity => entity.location.topLeft.x));
    const rightX = Math.max(...model.entities.map(entity => entity.location.bottomRight.x));

    const topY = Math.max(...model.entities.map(entity => entity.location.topLeft.y));
    const bottomY = Math.min(...model.entities.map(entity => entity.location.bottomRight.y));

    const importedWidth = leftX < 0
      ? (leftX * -1 + rightX)
      : rightX - leftX;

    const importedHeight = bottomY < 0
      ? (bottomY * -1 + topY)
      : topY - bottomY;

    return [canvasWidth / importedWidth, canvasHeight / importedHeight, leftX, topY];
  }

  calculateLengthBetweenXCoordinates (number, leftX) {
    if (number < 0) {
      return number - leftX;
    }

    return Math.abs(leftX) + number;
  }

  calculateLengthBetweenYCoordinates (number, topY) {
    if (number < 0) {
      return topY + Math.abs(number);
    }

    return topY - number;
  }

  render () {
    const {model} = this.props;

    const [widthScaleFactor, heightScaleFactor, leftX, topY] = this.calculateScalingFactors(model);

    return (
      <div id="diagramContainer" className='dynamic-demo relative'>
        {model.entities.map(entity => {
          return <div className="window" id={entity.id} style={
            {
              top: this.calculateLengthBetweenYCoordinates(entity.location.topLeft.y, topY) * heightScaleFactor,
              left: this.calculateLengthBetweenXCoordinates(entity.location.topLeft.x, leftX) * widthScaleFactor,
            }
          }><strong>{entity.name}</strong><br/><br/></div>;
        })}
      </div>
    );
  }
}

export default Diagram;
