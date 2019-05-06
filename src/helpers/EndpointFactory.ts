import IModel from "../models/IModel";
import {AnchorDirection} from "../models/AnchorDirection";


class EndpointFactory {
    static getAnchorPoints(direction: AnchorDirection = AnchorDirection.FLOW) {
        const flowDirection = direction === AnchorDirection.TOP ? -0.2 : (direction === AnchorDirection.BOTTOM ? 0.2 : 0);

        return [
            [0.2, 0, flowDirection,0,  0, 0],
            [0.5, 0, flowDirection,0,  0, 0],
            [0.8, 0, flowDirection,0,  0, 0],

            [0, 0.2, flowDirection,0,  0, 0],
            [0, 0.5, flowDirection,0,  0, 0],
            [0, 0.8, flowDirection,0,  0, 0],

            [1, 0.2, flowDirection, 0,0,  0],
            [1, 0.5, flowDirection, 0,0,  0],
            [1, 0.8, flowDirection, 0,0,  0],

            [0.2, 1, flowDirection, 0,0,  0],
            [0.5, 1, flowDirection, 0,0,  0],
            [0.8, 1, flowDirection, 0,0,  0]
        ];
    }

    private static buildCardinalityTag(component: any, model: IModel, matchIndex: number, useFrom: boolean) {
        const {source, target} = component;
        const sourceId = source.dataset.customId;
        const targetId = target.dataset.customId;

        const relation = model.relations.filter(x => x.from.ref === sourceId && x.to.ref === targetId)[matchIndex];

        if (relation === undefined) {
            return null;
        }

        const elem = document.createElement('div');
        elem.classList.add('tag', 'z-10');
        elem.innerHTML = `<p>${useFrom ? relation.from.cardinality : relation.to.cardinality}</p>`;
        return elem;
    }


    private static buildRelationName(component: any, model: IModel, matchIndex: number) {
        const {source, target} = component;
        const sourceId = source.dataset.customId;
        const targetId = target.dataset.customId;

        const relation = model.relations.filter(x => x.from.ref === sourceId && x.to.ref === targetId)[matchIndex];

        if (relation === undefined) {
            return null;
        }

        const elem = document.createElement('div');
        elem.classList.add('tag', 'z-10', 'hidden', 'relation-name');
        elem.innerHTML = `<p>${relation.name}</p>`;
        return elem;
    }

    static create(model: IModel, matchIndex: number): any {
        const lineColor = '#30364c';
        const connector = ['Bezier', {cssClass: 'connectorClass', hoverClass: 'connectorHoverClass', curviness: 100}]
        const connectorStyle = {
            strokeWidth: 3,
            stroke: lineColor
        };
        const hoverStyle = {
            stroke: '#449999'
        };
        const overlays = [
            ['Custom', {
                create: (component: any) => {
                    return this.buildCardinalityTag(component, model, matchIndex,true)
                },
                location: 0.1,
                id: 'fromCardinalityOverlay'
            }],
            ['Custom', {
                create: (component: any) => this.buildCardinalityTag(component, model,matchIndex, false),
                location: 0.9,
                id: 'toCardinalityOverlay'
            }],
            ['Custom', {
                create: (component: any) => this.buildRelationName(component, model, matchIndex),
                location: 0.5,
                id: 'relationName'
            }]
        ];
        const endpoint = ['Dot', {cssClass: 'endpointClass', radius: 5, hoverClass: 'endpointHoverClass'}]
        const endpointStyle = {fill: lineColor};

        return {
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
    }
}

export default EndpointFactory;
