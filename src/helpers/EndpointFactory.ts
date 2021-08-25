import IModel from "../models/IModel";
import {AnchorDirection} from "../models/AnchorDirection";


class EndpointFactory {
    /**
     * Get endpoint anchor points
     * 
     * @see https://docs.jsplumbtoolkit.com/community/current/articles/anchors.html
     * 
     * @param direction AnchorDirection
     * @returns Array any
     */
    public static getAnchorPoints(direction: AnchorDirection = AnchorDirection.FLOW): Array<any> {
        const flowDirection = direction === AnchorDirection.TOP ? -0.2 : (direction === AnchorDirection.BOTTOM ? 0.2 : 0);

        return [
            [0.2, 0, flowDirection, 0, 0, 0],
            [0.5, 0, flowDirection, 0, 0, 0],
            [0.8, 0, flowDirection, 0, 0, 0],

            [0, 0.2, flowDirection, 0, 0, 0],
            [0, 0.5, flowDirection, 0, 0, 0],
            [0, 0.8, flowDirection, 0, 0, 0],

            [1, 0.2, flowDirection, 0, 0, 0],
            [1, 0.5, flowDirection, 0, 0, 0],
            [1, 0.8, flowDirection, 0, 0, 0],

            [0.2, 1, flowDirection, 0, 0, 0],
            [0.5, 1, flowDirection, 0, 0, 0],
            [0.8, 1, flowDirection, 0, 0, 0]
        ];
    }
    
    /**
     * Create endpoint config
     * 
     * @see https://docs.jsplumbtoolkit.com/community/current/articles/endpoints.html
     * 
     * @param model IModel
     * @param matchIndex number
     * @param isPending boolean
     * @returns any
     */
    public static create(model: IModel, matchIndex: number, isPending: boolean = false): any {
        const lineColor = '#30364c';

        const connector = ['Bezier', {cssClass: 'connectorClass', hoverClass: 'connectorHoverClass', curviness: 100}],
            endpoint = ['Dot', {cssClass: 'endpointClass', radius: 5, hoverClass: 'endpointHoverClass'}];

        const connectorStyle = {
            strokeWidth: 3,
            stroke: lineColor
        }, hoverStyle = {
            stroke: '#449999'
        }, endpointStyle = {fill: lineColor};

        const overlays = isPending ? [] : [
            ['Custom', {
                create: (component: any) => this.buildCardinalityTag(component, model, matchIndex,true),
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

    /**
     * Get overlay element for cardinality label
     * 
     * @see https://docs.jsplumbtoolkit.com/community/current/articles/overlays.html
     * 
     * @param component any
     * @param model IModel
     * @param matchIndex number
     * @param useFrom boolean
     * @returns HTMLDivElement | null
     */
    private static buildCardinalityTag(component: any, model: IModel, matchIndex: number, useFrom: boolean): HTMLDivElement | null {
        const { source, target } = component;

        const sourceId = source.dataset.customId,
            targetId = target.dataset.customId,
            relation = model.relations.filter(x => x.from.ref === sourceId && x.to.ref === targetId)[matchIndex];

        if (relation === undefined) {
            return null;
        }

        const elem = document.createElement('div');
        elem.classList.add('tag', 'z-10');
        elem.innerHTML = `<p>${useFrom ? relation.from.cardinality : relation.to.cardinality}</p>`;

        return elem;
    }

    /**
     * Get overlay element for relation label
     * 
     * @see https://docs.jsplumbtoolkit.com/community/current/articles/overlays.html
     * 
     * @param component any
     * @param model IModel
     * @param matchIndex number
     * @returns HTMLDivElement | null
     */
    private static buildRelationName(component: any, model: IModel, matchIndex: number): HTMLDivElement | null {
        const { source, target } = component;

        const sourceId = source.dataset.customId,
            targetId = target.dataset.customId,
            relation = model.relations.filter(x => x.from.ref === sourceId && x.to.ref === targetId)[matchIndex];

        if (relation === undefined) {
            return null;
        }

        const elem = document.createElement('div');
        elem.classList.add('tag', 'z-10', 'hidden', 'relation-name');
        elem.innerHTML = `<p>${relation.name}</p>`;

        return elem;
    }
}

export default EndpointFactory;
