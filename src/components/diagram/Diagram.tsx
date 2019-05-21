import React, {Component} from 'react';
import {Connection, jsPlumb, OnConnectionBindInfo} from 'jsplumb';
import Entity from "./Entity";
import IEntity from "../../models/IEntity";
import IModel from "../../models/IModel";
import {SelectedDataType} from "../../models/SelectedDataType";
import {AnchorDirection} from "../../models/AnchorDirection";
import EndpointFactory from "../../helpers/EndpointFactory";
import {DistanceHelper} from "../../helpers/DistanceHelper";
import {Scaling} from "../../models/Scaling";
import IRectangleCoordinates from "../../models/IRectangleCoordinates";

interface IProps {
    model: IModel,
    scaling: Scaling,
    onModelSelectionChange: (selectedDataType: SelectedDataType, selectedId: string | undefined) => void,
    onEntityMoved: (entityId: string, nextCoordinates: IRectangleCoordinates) => void
}

interface IState {
}

const confirm = (data: any) => {
    return true;
};

class Diagram extends Component<IProps, IState> {
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

                instance.bind('click', (conn: Connection) => {
                    this.diagram.detach(conn);
                });

                instance.bind('beforeDetach', (info: OnConnectionBindInfo) => confirm('Delete connection?'));

                res(instance);
            });
        });
    }

    loadDiagramWithData(props: IProps) {
        const {model, scaling, onEntityMoved} = props

        this.diagram.batch(() => {
            const connections: { [key: string]: string[] } = model.relations.reduce((acc: { [key: string]: string[] }, cur) => {
                if (!acc.hasOwnProperty(cur.from.ref)) {
                    acc[cur.from.ref] = [];
                }

                acc[cur.from.ref] = [...acc[cur.from.ref], cur.to.ref];
                return acc;
            }, {});

            const entityElements = document.querySelectorAll('.editor .entity');

            Object.keys(connections).forEach((sourceId: string) => {
                if (connections.hasOwnProperty(sourceId)) {
                    const connected = connections[sourceId];

                    connected.forEach((targetId, index) => {
                        const sourceElem = document.querySelector('.entity-' + sourceId)!;
                        const targetElem = document.querySelector('.entity-' + targetId)!;
                        const connectionsToSameEntity = connected.filter(id => id === targetId).length;
                        const matchIndex = index - connected.findIndex(x => x === targetId);
                        let direction = AnchorDirection.FLOW;

                        if (connectionsToSameEntity >= 2) {
                            direction = matchIndex === 0 ? AnchorDirection.BOTTOM : (matchIndex === 1 ? AnchorDirection.TOP : AnchorDirection.FLOW)
                        }

                        this.diagram.connect({
                            source: this.diagram.addEndpoint(sourceElem, EndpointFactory.create(model, matchIndex), {anchor: EndpointFactory.getAnchorPoints(direction)}),
                            target: this.diagram.addEndpoint(targetElem, EndpointFactory.create(model, matchIndex), {anchor: EndpointFactory.getAnchorPoints(direction)}),
                        });
                    });
                }
            });

            let startTop = 0;
            let finalTop = 0;
            let startLeft = 0;
            let finalLeft = 0;

            this.diagram.draggable(entityElements, {
                start: function(e: any){
                    startTop = parseInt(e.el.style.top);
                    startLeft = parseInt(e.el.style.left);

                },
                stop: function(e: any){
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
