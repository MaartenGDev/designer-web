import IModel from "../models/IModel";

class EndpointFactory {
    static getAnchorPoints() {
        return [
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
    }

    private static buildCardinalityTag(component: any, model: IModel, useFrom: boolean) {
        const {sourceId, targetId} = component;
        const relation = model.relations.find(x => x.from.ref === sourceId && x.to.ref === targetId);

        if (relation === undefined) {
            return null;
        }

        const elem = document.createElement('div');
        elem.classList.add('tag', 'z-10');
        elem.innerHTML = `<p>${useFrom ? relation.from.cardinality : relation.to.cardinality}</p>`;
        return elem;
    }



    private static buildRelationName(component: any, model: IModel, useFrom: boolean) {
        const {sourceId, targetId} = component;
        const relation = model.relations.find(x => x.from.ref === sourceId && x.to.ref === targetId);

        if (relation === undefined) {
            return null;
        }

        const elem = document.createElement('div');
        elem.classList.add('tag', 'z-10');
        elem.innerHTML = `<p>${relation.name}</p>`;
        return elem;
    }

    static create(model: IModel): any {
        const lineColor = '#30364c';
        const connector = ['Bezier', {cssClass: 'connectorClass', hoverClass: 'connectorHoverClass'}]
        const connectorStyle = {
            strokeWidth: 3,
            stroke: lineColor
        };
        const hoverStyle = {
            stroke: '#449999'
        };
        const overlays = [
            ['Custom', {
                create: (component: any) => this.buildCardinalityTag(component, model, true),
                location: 0.1,
                id: 'fromCardinalityOverlay'
            }],
            ['Custom', {
                create: (component: any) => this.buildCardinalityTag(component, model, false),
                location: 0.9,
                id: 'toCardinalityOverlay'
            }],
            ['Custom', {
                create: (component: any) => this.buildRelationName(component, model, false),
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
