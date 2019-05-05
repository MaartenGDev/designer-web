import React, {Component} from 'react';
import {Connection, jsPlumb, OnConnectionBindInfo} from 'jsplumb';
import IModel from "../models/IModel";
import EndpointFactory from "../helpers/EndpointFactory";
import {SelectedDataType} from "../models/SelectedDataType";
import IEntityIdentifier from "../models/IEntityIdentifier";

interface IProps {
    model: IModel,
    onModelSelectionChange: (selectedDataType: SelectedDataType, selectedId: string | undefined) => void
}

interface IState {
}

const confirm = (data: any) => {
    return true;
};

class Diagram extends Component<IProps, IState> {
    private diagram: any;
    private hasLoadedDataForDiagramAtLeastOnce = false;

    async componentDidMount() {
        const {model} = this.props;

        this.diagram = await this.buildDiagramInstance();
        this.loadDataForDiagram(model);
    }

    async componentWillReceiveProps(nextProps: Readonly<IProps>, nextContext: any) {
        if(this.props.model === nextProps.model) return;
        await this.resetDiagram();
        this.loadDataForDiagram(nextProps.model);
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

    loadDataForDiagram(model: IModel) {
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

                        this.diagram.connect({
                            source: this.diagram.addEndpoint(sourceId, EndpointFactory.create(model), {anchor: EndpointFactory.getAnchorPoints()}),
                            target: this.diagram.addEndpoint(targetId, EndpointFactory.create(model), {anchor: EndpointFactory.getAnchorPoints()})
                        });
                    }
                }
            }

            this.diagram.draggable(entityElements, {force: true});
            this.hasLoadedDataForDiagramAtLeastOnce = true;
        });
    }

    private calculateScalingFactors(model: IModel) {
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

    private calculateLengthBetweenXCoordinates(number: number, leftX: number) {
        if (number < 0) {
            return number - leftX;
        }

        return Math.abs(leftX) + number;
    }

    private calculateLengthBetweenYCoordinates(number: number, topY: number) {
        if (number < 0) {
            return topY + Math.abs(number);
        }

        return topY - number;
    }

    private getLabelForIdentifier(identifier: IEntityIdentifier | undefined){
        if(identifier === undefined) return '';
        if(identifier.isPrimary) return '<pi>';

        return '<i>';
    }

    render() {
        const {model, onModelSelectionChange} = this.props;

        const [widthScaleFactor, heightScaleFactor, leftX, topY] = this.calculateScalingFactors(model);

        return (
            <div id="diagramContainer" className='editor relative flex-grow overflow-auto'>
                {model.entities.map((entity) => {
                    return <div key={entity.id} id={entity.id} className={`entity absolute bg-white shadow ${model.relations.find(x => x.from.ref === entity.id || x.to.ref === entity.id) === undefined ? '' : 'has-relations'}`} style={{
                        top: this.calculateLengthBetweenYCoordinates(entity.location.topLeft.y, topY) * heightScaleFactor,
                        left: this.calculateLengthBetweenXCoordinates(entity.location.topLeft.x, leftX) * widthScaleFactor,
                    }} onClick={e => {
                        e.stopPropagation();
                        onModelSelectionChange(SelectedDataType.ENTITY, entity.id)
                    }}>
                        <div className='p-4 border-b border-grey-lighter font-bold text-grey-darker'>
                            <p>{entity.name}</p>
                        </div>
                        <div className='p-4'>
                            <table className='text-sm'>
                                <tbody>
                                {entity.attributes.map(attribute => {
                                    const identifier = entity.identifiers.find(identifier => identifier.attributeId === attribute.id);

                                    return <tr key={attribute.id} className={identifier !== undefined && identifier.isPrimary ? 'primary-identifier-row' : ''}>
                                        <td className='pr-2'>{model.dataItems[attribute.dataItemId].name}</td>
                                        <td>{this.getLabelForIdentifier(identifier)}</td>
                                        <td className='pl-2'>{model.dataItems[attribute.dataItemId].domainId === undefined ? model.dataItems[attribute.dataItemId].name : model.domains[model.dataItems[attribute.dataItemId].domainId!].name}</td>
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
