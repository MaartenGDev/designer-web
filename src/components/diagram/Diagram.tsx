import React, {Component} from 'react';
import {Connection, jsPlumb} from 'jsplumb';
import Entity from "./Entity";
import IEntity from "../../models/IEntity";
import IModel from "../../models/IModel";
import {SelectedDataType} from "../../models/SelectedDataType";
import {AnchorDirection} from "../../models/AnchorDirection";
import EndpointFactory from "../../helpers/EndpointFactory";
import {DistanceHelper} from "../../helpers/DistanceHelper";
import {Scaling} from "../../models/Scaling";
import IRectangleCoordinates from "../../models/IRectangleCoordinates";
import IRelation from "../../models/IRelation";

interface IProps {
    model: IModel,
    scaling: Scaling,
    onModelSelectionChange: (selectedDataType: SelectedDataType, selectedId: string | undefined) => void,
    onRelationCreated: (sourceEntityId: string, targetEntityId: string) => void,
    onEntityMoved: (entityId: string, nextCoordinates: IRectangleCoordinates) => void
    onRelationClicked: (relation: IRelation) => void
}

class Diagram extends Component<IProps> {
    private diagram: any;

    async componentDidMount() {
        this.diagram = await this.buildDiagramInstance();
        this.loadDiagramWithData(this.props);
    }

    async componentWillReceiveProps(nextProps: Readonly<IProps>, nextContext: any) {
        if (this.props.model === nextProps.model) return;
        await this.resetDiagram();
        this.loadDiagramWithData(nextProps);
    }

    resetDiagram = async () => {
        this.diagram.cleanupListeners();
        this.diagram.deleteEveryConnection();
        this.diagram.deleteEveryEndpoint();

        this.diagram = await this.buildDiagramInstance();
    };

    buildDiagramInstance(): any {
        return new Promise((res, rej) => {
            (jsPlumb as any).ready(() => {
                const instance = jsPlumb.getInstance({
                    DragOptions: {cursor: 'pointer', zIndex: 1},
                    Container: 'canvas'
                });

                instance.bind('click', (conn: Connection, ev) => {
                    const parameters = (conn as any).getParameters();
                    const relation = this.props.model.relations.find(x => x.id === parameters.relationId)!;

                    ev.stopPropagation();
                    this.props.onRelationClicked(relation);
                });

                res(instance);
            });
        });
    }

    loadDiagramWithData(props: IProps) {
        const {model, scaling, onEntityMoved, onRelationCreated} = props

        this.diagram.batch(() => {
            const connections: { [key: string]: {relationId: string, ref: string}[] } = model.relations.reduce((acc: { [key: string]: {relationId: string, ref: string}[] }, cur) => {
                if (!acc.hasOwnProperty(cur.from.ref)) {
                    acc[cur.from.ref] = [];
                }

                acc[cur.from.ref] = [...acc[cur.from.ref], {relationId: cur.id, ref: cur.to.ref}];
                return acc;
            }, {});

            const entityElements = document.querySelectorAll('.editor .entity');
            let pendingRelations: {[key: string]: boolean} = {};

            Object.keys(connections).forEach((sourceId: string) => {
                if (connections.hasOwnProperty(sourceId)) {
                    const connected = connections[sourceId];

                    connected.forEach((target: {relationId: string, ref: string}, index) => {
                        const sourceElem = document.querySelector('.entity-' + sourceId)!;
                        const targetElem = document.querySelector('.entity-' + target.ref)!;
                        const connectionsToSameEntity = connected.filter(id => id.ref === target.ref).length;
                        const matchIndex = index - connected.findIndex(x => x.ref === target.ref);
                        let direction = AnchorDirection.FLOW;

                        if (connectionsToSameEntity >= 2) {
                            direction = matchIndex === 0 ? AnchorDirection.BOTTOM : (matchIndex === 1 ? AnchorDirection.TOP : AnchorDirection.FLOW)
                        }


                        const beforeDrop = (params: any) => {
                            const sourceEntityId = (document.querySelector(`#${params.sourceId}`) as HTMLElement).dataset.customId!;
                            const targetEntityId = (document.querySelector(`#${params.targetId}`) as HTMLElement).dataset.customId!;

                            const relationKey = sourceEntityId + targetEntityId;

                            if(pendingRelations.hasOwnProperty(relationKey)){
                                return;
                            }

                            onRelationCreated(sourceEntityId, targetEntityId);
                            pendingRelations[relationKey] = true;

                            return false;
                        };

                        this.diagram.makeSource(sourceElem, {beforeDrop: beforeDrop, filter: '.connect-point', ...EndpointFactory.create(model, matchIndex, true)}, {anchor: EndpointFactory.getAnchorPoints(direction)});
                        this.diagram.makeSource(targetElem, {beforeDrop: beforeDrop, filter: '.connect-point', ...EndpointFactory.create(model, matchIndex, true)}, {anchor: EndpointFactory.getAnchorPoints(direction)});

                        const conn = this.diagram.connect({
                            source: this.diagram.addEndpoint(sourceElem, EndpointFactory.create(model, matchIndex), {anchor: EndpointFactory.getAnchorPoints(direction)}),
                            target: this.diagram.addEndpoint(targetElem, EndpointFactory.create(model, matchIndex), {anchor: EndpointFactory.getAnchorPoints(direction)}),
                        });

                        conn.setParameter('relationId', target.relationId);
                    });
                }
            });

            let startTop = 0;
            let finalTop = 0;
            let startLeft = 0;
            let finalLeft = 0;

            this.diagram.draggable(entityElements, {
                start: function(e: any){
                    e.el.classList.add('has-recently-been-dragged');
                    startTop = parseInt(e.el.style.top);
                    startLeft = parseInt(e.el.style.left);
                },
                drag:function(e: any){
                    e.e.stopImmediatePropagation();
                    e.e.stopPropagation();
                },
                stop: function(e: any){
                    // Hack because we have to wait on the click to fire
                    setTimeout(() => {
                        e.el.classList.remove('has-recently-been-dragged');
                    }, 200);

                    finalTop = parseInt(e.el.style.top);
                    finalLeft = parseInt(e.el.style.left);

                    const entity = model.entities.find(x => x.id === e.el.dataset.customId)!;

                    const topDifference = Math.round((startTop - finalTop) * scaling.upScalingFactor);
                    const leftDifference = Math.round((finalLeft - startLeft) * scaling.upScalingFactor);

                    onEntityMoved(entity.id, {
                        topLeft: {
                            x: entity.location.topLeft.x + leftDifference,
                            y: entity.location.topLeft.y + topDifference
                        },
                        bottomRight: {
                            x: entity.location.bottomRight.x + leftDifference,
                            y: entity.location.bottomRight.y + topDifference
                        },
                    });
                }
            });


        });
    }

    private calculateScalingFactors(model: IModel) {
        const leftX = Math.min(...model.entities.map(entity => entity.location.topLeft.x));
        const topY = Math.max(...model.entities.map(entity => entity.location.topLeft.y));

        return [leftX, topY];
    }

    render() {
        const {model, onModelSelectionChange, scaling} = this.props;
        const [leftX, topY] = this.calculateScalingFactors(model);
        const topOffset = 10;

        return (
            <div id="diagramContainer" className='editor relative flex-grow overflow-auto'>
                {model.entities.map((entity: IEntity) => {
                    return <Entity
                        key={entity.id}
                        model={model}
                        entity={entity}
                        onModelSelectionChange={onModelSelectionChange}
                        position={{
                            top: (DistanceHelper.calculateLengthBetweenYCoordinates(entity.location.topLeft.y, topY) * scaling.downScalingFactor) + topOffset,
                            left: DistanceHelper.calculateLengthBetweenXCoordinates(entity.location.topLeft.x, leftX) * scaling.downScalingFactor,
                        }}
                    />
                })}
            </div>
        );
    }
}

export default Diagram;
