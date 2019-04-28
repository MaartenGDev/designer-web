import React, { Component } from 'react';
import {Connection, Endpoint, jsPlumb} from 'jsplumb';
import IModel from "../models/IModel";

interface IProps {
  model: IModel
}

interface IState {}

const confirm = (data: any) => {
  return true;
};

class Diagram extends Component<IProps, IState> {
  componentDidMount () {
    const {model} = this.props;

    this.loadDiagram(model);
  }

  buildCardinalityTag (component: any, model: IModel, useFrom: boolean) {
    const {sourceId, targetId} = component;
    const relation = model.relations.find(x => x.from.ref === sourceId && x.to.ref === targetId);

    if(relation === undefined){
      return null;
    }

    const elem = document.createElement('div');
    elem.classList.add('tag', 'z-10');
    elem.innerHTML = `<p>${useFrom ? relation.from.cardinality : relation.to.cardinality}</p>`;
    return elem;
  }

  loadDiagram (model: IModel) {
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

    (jsPlumb as any).ready(() => {
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
            create: (component: any) => this.buildCardinalityTag(component, model, true),
            location: 0.1,
            id: 'fromCardinalityOverlay'
          }],
          ['Custom', {
            create: (component: any) => this.buildCardinalityTag(component, model, false),
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

      const instance: any = jsPlumb.getInstance({
        DragOptions: {cursor: 'pointer', zIndex: 1},
        Container: 'canvas'
      });

      instance.batch(() => {
        const connections: {[key: string]: string[]} = model.relations.reduce((acc: {[key: string]: string[]}, cur) => {
          if (!acc.hasOwnProperty(cur.from.ref)) {
            acc[cur.from.ref] = [];
          }

          acc[cur.from.ref] = [...acc[cur.from.ref], cur.to.ref];
          return acc;
        }, {});

        const divsWithWindowClass = document.querySelectorAll('.dynamic-demo .window');

        for (var i = 0; i < divsWithWindowClass.length; i++) {
          var sourceId = divsWithWindowClass[i].id;

          if (connections.hasOwnProperty(sourceId)) {
            const connected = connections[sourceId];
            for (const targetId of connected) {
              const sourceEndpoint: Endpoint = instance.addEndpoint(sourceId, anEndpoint, {anchor: anchorPoints});
              const targetEndpoint: Endpoint = instance.addEndpoint(targetId, anEndpoint, {anchor: anchorPoints});

              instance.connect({
                source: sourceEndpoint,
                target: targetEndpoint
              });
            }
          }
        }

        // bind click listener; delete connections on click
        instance.bind('click', function (conn: Connection) {
          instance.detach(conn);
        });

        // bind beforeDetach interceptor: will be fired when the click handler above calls detach, and the user
        // will be prompted to confirm deletion.
        instance.bind('beforeDetach', function (conn: Connection) {
          return confirm('Delete connection?');
        });

        instance.draggable(divsWithWindowClass);

        (jsPlumb as any).fire('jsPlumbDemoLoaded', instance);
      });
    });
  }

  calculateScalingFactors (model: IModel) {
    const diagramWindow = document.querySelector('#diagram-window')!;

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

  calculateLengthBetweenXCoordinates (number: number, leftX: number) {
    if (number < 0) {
      return number - leftX;
    }

    return Math.abs(leftX) + number;
  }

  calculateLengthBetweenYCoordinates (number: number, topY: number) {
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
          }>
            <p>{entity.name}</p>
            <table className='text-sm'>
              {entity.attributeIds.map(attributeId => {
                return <tr><td>{model.attributes[attributeId].name}</td><td>PK</td><td>DOMAIN</td></tr>
              })}
            </table>
          </div>;
        })}
      </div>
    );
  }
}

export default Diagram;
