import React, {Component} from 'react';
import {Connection, Endpoint, jsPlumb, jsPlumbInstance} from 'jsplumb';
import IModel from "../models/IModel";
import EndpointFactory from "../helpers/EndpointFactory";

interface IProps {
    model: IModel
}

interface IState {
}

const confirm = (data: any) => {
    return true;
};

class Diagram extends Component<IProps, IState> {
    private diagram: any;

    async componentDidMount() {
        const {model} = this.props;

        this.diagram = await this.setupDiagram();
        this.loadDiagram(model);
    }

    componentWillReceiveProps(nextProps: Readonly<IProps>, nextContext: any): void {
        this.loadDiagram(nextProps.model);
    }

    setupDiagram(): any {
        return new Promise((res, rej) => {
            (jsPlumb as any).ready(() => {
                res(jsPlumb.getInstance({
                    DragOptions: {cursor: 'pointer', zIndex: 1},
                    Container: 'canvas'
                }));
            });
        });
    }

    loadDiagram(model: IModel) {
        this.diagram.batch(() => {
            const connections: { [key: string]: string[] } = model.relations.reduce((acc: { [key: string]: string[] }, cur) => {
                if (!acc.hasOwnProperty(cur.from.ref)) {
                    acc[cur.from.ref] = [];
                }

                acc[cur.from.ref] = [...acc[cur.from.ref], cur.to.ref];
                return acc;
            }, {});

            const entityElements = document.querySelectorAll('.editor .entity');

            for (let i = 0; i < entityElements.length; i++) {
                const sourceId = entityElements[i].id;

                if (connections.hasOwnProperty(sourceId)) {
                    const connected = connections[sourceId];
                    for (const targetId of connected) {
                        const sourceEndpoint: Endpoint = this.diagram.addEndpoint(sourceId, EndpointFactory.create(model), {anchor: EndpointFactory.getAnchorPoints()});
                        const targetEndpoint: Endpoint = this.diagram.addEndpoint(targetId, EndpointFactory.create(model), {anchor: EndpointFactory.getAnchorPoints()});

                        this.diagram.connect({
                            source: sourceEndpoint,
                            target: targetEndpoint
                        });
                    }
                }
            }

            this.diagram.bind('click', (conn: Connection) => {
                this.diagram.detach(conn);
            });

            this.diagram.bind('beforeDetach', function (conn: Connection) {
                return confirm('Delete connection?');
            });

            this.diagram.draggable(entityElements);
        });
    }

    calculateScalingFactors(model: IModel) {
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

    calculateLengthBetweenXCoordinates(number: number, leftX: number) {
        if (number < 0) {
            return number - leftX;
        }

        return Math.abs(leftX) + number;
    }

    calculateLengthBetweenYCoordinates(number: number, topY: number) {
        if (number < 0) {
            return topY + Math.abs(number);
        }

        return topY - number;
    }

    render() {
        const {model} = this.props;

        const [widthScaleFactor, heightScaleFactor, leftX, topY] = this.calculateScalingFactors(model);

        return (
            <div id="diagramContainer" className='editor relative'>
                {model.entities.map(entity => {
                    return <div className="entity absolute bg-white shadow-md" id={entity.id} style={
                        {
                            top: this.calculateLengthBetweenYCoordinates(entity.location.topLeft.y, topY) * heightScaleFactor,
                            left: this.calculateLengthBetweenXCoordinates(entity.location.topLeft.x, leftX) * widthScaleFactor,
                        }
                    }>
                        <div className='p-2 border-b border-grey-lighter font-bold text-grey-darker'>
                            <p>{entity.name}</p>
                        </div>
                        <div className='p-2'>
                            <table className='text-sm'>
                                <tbody>
                                {entity.attributeIds.map(attributeId => {
                                    const isPrimaryIdentifier = model.attributes[attributeId].domainId !== undefined && model.domains[model.attributes[attributeId].domainId!].dataType === 'I';

                                    return <tr className={isPrimaryIdentifier ? 'primary-identifier-row' : ''}>
                                        <td className='pr-2'>{model.attributes[attributeId].name}</td>
                                        <td>{isPrimaryIdentifier ? '<pi>' : ''}</td>
                                        <td className='pl-2'>{model.attributes[attributeId].domainId === undefined ? model.attributes[attributeId].name : model.domains[model.attributes[attributeId].domainId!].name}</td>
                                    </tr>
                                })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                })}
            </div>
        );
    }
}

export default Diagram;
