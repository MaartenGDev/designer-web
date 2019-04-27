import React, { Component } from 'react';
import { jsPlumb } from 'jsplumb';

const confirm = (data) => {
  return true;
};

class Diagram extends Component {
  componentDidMount () {
    const {model} = this.props;




    jsPlumb.ready(function () {
      var sourceAnchors = [],
        targetAnchors = [],
        lineColor = '#30364c',
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
          ["Custom", {
            create:function(component) {
              const elem = document.createElement('div');
              elem.classList.add('tag');
              elem.classList.add('z-10');
              elem.innerHTML = '<p>1..1</p>';
              return elem;
            },
            location:0.1,
            id:"customOverlay"
          }],
          ["Custom", {
            create:function(component) {
              const elem = document.createElement('div');
              elem.classList.add('tag');
              elem.classList.add('z-10');
              elem.innerHTML = '<p>1..*</p>';
              return elem;
            },
            location:0.9,
            id:"customOverlay2"
          }]
        ],
        endpoint = ['Dot', {cssClass: 'endpointClass', radius: 10, hoverClass: 'endpointHoverClass'}],
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

      // suspend drawing and initialise.
      instance.batch(function () {
        const connections = model.relations.reduce((acc, cur) => {
          if (!acc.hasOwnProperty(cur.from)) {
            acc[cur.from] = [];
          }

          acc[cur.from] = [...acc[cur.from], cur.to];
          return acc;
        }, {});

        var endpoints = {};
        // ask jsPlumb for a selector for the window class
        var divsWithWindowClass = jsPlumb.getSelector('.dynamic-demo .window');

        // add endpoints to all of these - one for source, and one for target, configured so they don't sit
        // on top of each other.
        for (var i = 0; i < divsWithWindowClass.length; i++) {
          var id = instance.getId(divsWithWindowClass[i]);
          endpoints[id] = [
            // note the three-arg version of addEndpoint; lets you re-use some common settings easily.
            instance.addEndpoint(id, anEndpoint, {anchor: sourceAnchors}),
            instance.addEndpoint(id, anEndpoint, {anchor: targetAnchors})
          ];
        }
        // then connect everything using the connections map declared above.
        for (var e in endpoints) {
          if (connections[e]) {
            for (var j = 0; j < connections[e].length; j++) {
              instance.connect({
                source: endpoints[e][0],
                target: endpoints[connections[e][j]][1]
              });
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

  calculateScalingFactors(model){
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

  calculateOffset(number, isForX, leftX, topY){
    if(number < 0){
      if(!isForX){
        return topY + Math.abs(number);
      }
      return number - (isForX ? leftX : topY);
    }

    if(!isForX){
      return topY - number;
    }

    return Math.abs(isForX ? leftX : topY) + number;
  }

  render () {
    const {model} = this.props;


    const [widthScaleFactor, heightScaleFactor, leftX, topY] = this.calculateScalingFactors(model);

    return (
      <div id="diagramContainer" className='dynamic-demo relative'>
        {model.entities.map(entity => {
          return <div className="window" id={entity.id} style={
            {
              top: this.calculateOffset(entity.location.topLeft.y, false, leftX,  topY) * heightScaleFactor,
              left: this.calculateOffset(entity.location.topLeft.x , true, leftX, topY) * widthScaleFactor,
            }
          }><strong>{entity.name}</strong><br/><br/></div>;
        })}
      </div>
    );
  }
}

export default Diagram;
