import * as React from 'react';
import {Component} from 'react';
import xmlParser from './parsers/modelParser';
import IModel from "./models/IModel";
import {SelectedDataType} from "./models/SelectedDataType";
import EntityEditor from "./components/editors/EntityEditor";
import {MdClose} from 'react-icons/md'
import CDMModel from "./parsers/CDMModel";
import IEntity from "./models/IEntity";
import {DownloadHelper} from "./helpers/DownloadHelper";
import {EntityIdentifierChangeAction} from "./models/EntityIdentifierChangeAction";
import DomainsEditor from "./components/editors/DomainsEditor";
import {toast, ToastContainer} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import SizingRenderer from "./components/diagram/SizingRenderer";
import Diagram from "./components/diagram/Diagram";
import {Scaling} from "./models/Scaling";
import IRectangleCoordinates from "./models/IRectangleCoordinates";
import {DIAGRAM} from './demo'
import RelationEditor from "./components/editors/RelationEditor";
import IRelation from "./models/IRelation";

interface IProps {
}

interface IState {
    modelXml: string,
    model: IModel,
    selectedId: string | undefined,
    scaling: Scaling | undefined,
    selectedDataType: SelectedDataType
}

class App extends Component<IProps, IState> {
    private CDMModel = new CDMModel();

    state = {
        modelXml: '',
        model: {
            entities: [],
            dataItems: {},
            relations: [],
            domains: {}
        },
        scaling: undefined,
        selectedId: undefined,
        selectedDataType: SelectedDataType.NONE
    };

    componentDidMount(): void {
        this.CDMModel.loadFromXml(DIAGRAM);
        this.handleModelSourceChange(DIAGRAM);
    }

    handleModelSourceChange = (xml: string) => {
        xmlParser(xml, (data: IModel) => {
            this.setState({
                model: data,
                modelXml: xml
            });
        });
    };

    handleModelSelectionChange = (selectedDataType: SelectedDataType, selectedId?: string | undefined) => {
        this.setState({
            selectedId,
            selectedDataType
        });
    };

    private createEntity = (name: string) => {
        this.CDMModel.createEntity(name);
        this.handleModelSourceChange(this.CDMModel.getAsXml());
    };

    private handleEntityChange = (entityId: string, attributeName: string, value: any) => {
        this.CDMModel.setAttributeForEntity(entityId, attributeName, value);
        this.handleModelSourceChange(this.CDMModel.getAsXml());
    };

    private handleEntityAttributeChange = (entityId: string, attributeId: string, dataItemId: string, nextDataType: string, nextDataTypeLength: number) => {
        this.CDMModel.setDataTypeAndLengthForDataItem(dataItemId, nextDataType, nextDataTypeLength);
        this.handleModelSourceChange(this.CDMModel.getAsXml());
    };

    private handleEntityAttributeCreation = (entityId: string, name: string, dataType: string, length: number) => {
        this.CDMModel.createAttributeForEntity(entityId, name, dataType, length);
        this.handleModelSourceChange(this.CDMModel.getAsXml());
    };

    private handleEntityAttributeRemoval = (entityId: string, attributeId: string) => {
        this.CDMModel.removeAttributeForEntity(entityId, attributeId);

        this.handleModelSourceChange(this.CDMModel.getAsXml());
    };

    private handleEntityAttributeDomainChange = (entityId: string, attributeId: string, dataItemId: string, nextDomainId: string) => {
        this.CDMModel.setDomainForDataItem(dataItemId, nextDomainId);
        this.handleModelSourceChange(this.CDMModel.getAsXml());
    };

    private handleEntityIdentifierChange = (entityId: string, changeAction: EntityIdentifierChangeAction, attributeId: string) => {
        if (changeAction === EntityIdentifierChangeAction.NONE) {
            this.CDMModel.removeIdentifierForEntity(entityId, attributeId);
        }

        if (changeAction === EntityIdentifierChangeAction.REGULAR || changeAction === EntityIdentifierChangeAction.PRIMARY) {
            this.CDMModel.addIdentifierForEntity(entityId, attributeId, changeAction === EntityIdentifierChangeAction.PRIMARY);
        }

        this.handleModelSourceChange(this.CDMModel.getAsXml());
    };

    private handleDomainChange = (domainId: string, name: string, dataType: string, length: number) => {
        this.CDMModel.setDataTypeAndLengthForDomain(domainId, name, dataType, length);
        this.handleModelSourceChange(this.CDMModel.getAsXml());
    };

    private handleDomainRemoval = (domainId: string) => {
        if (this.CDMModel.removeDomain(domainId)) {
            return this.handleModelSourceChange(this.CDMModel.getAsXml());
        }

        toast.error('Failed to delete domain, there are entities using this domain.');
    };

    private handleDomainCreation = (name: string, dataType: string, length: number) => {
        this.CDMModel.createDomain(name, dataType, length);
        this.handleModelSourceChange(this.CDMModel.getAsXml());
    };

    private handleEntityMoved = (entityId: string, nextCoordinates: IRectangleCoordinates) => {
        this.CDMModel.moveEntity(entityId, nextCoordinates);
        this.handleModelSourceChange(this.CDMModel.getAsXml());
    };


    private handleRelationChange = (relationId: string, attributeName: string, value: any) => {
        this.CDMModel.setAttributeForRelation(relationId, attributeName, value);
        this.handleModelSourceChange(this.CDMModel.getAsXml());
    };

    private handleRelationFromRefChange = (relationId: string, targetEntityId: string) => {
        this.CDMModel.setFromRefOfRelation(relationId, targetEntityId);
        this.handleModelSourceChange(this.CDMModel.getAsXml());
    };

    private handleRelationToRefChange = (relationId: string, targetEntityId: string) => {
        this.CDMModel.setToRefOfRelation(relationId, targetEntityId);
        this.handleModelSourceChange(this.CDMModel.getAsXml());
    };

    private handleRelationFromCardinalityChange = (relationId: string, nextCardinality: string) => {
        this.CDMModel.setFromCardinalityOfRelation(relationId, nextCardinality);
        this.handleModelSourceChange(this.CDMModel.getAsXml());
    };

    private handleRelationToCardinalityChange = (relationId: string, nextCardinality: string) => {
        this.CDMModel.setToCardinalityOfRelation(relationId, nextCardinality);
        this.handleModelSourceChange(this.CDMModel.getAsXml());
    };

    private getEditableDataForSelection = (model: IModel, selectedDataType: SelectedDataType, selectedId: string): IEntity | undefined => {
        if (selectedDataType === SelectedDataType.NONE) return undefined;
        if (selectedDataType === SelectedDataType.ENTITY) return model.entities.find(x => x.id === selectedId);

        return undefined
    };

    private downloadModel = () => {
        const data = this.CDMModel.getAsXml();

        DownloadHelper.downloadAsFile('model.cdm', data)
    };

    private handleModelImport = (e: { target: HTMLInputElement }) => {
        if (e.target.files === null || e.target.files.length === 0) return;
        const reader = new FileReader();

        reader.onload = () => {
            if (reader.result === null) return;
            const result = reader.result.toString();

            this.CDMModel.loadFromXml(result);
            this.handleModelSourceChange(result);
        };

        reader.readAsText(e.target.files[0])
    };

    render() {
        const {model, selectedDataType, selectedId, scaling} = this.state;
        const hasLoadedModel = model.entities.length > 0;

        return (
            <div className="relative w-full">
                {selectedDataType !== SelectedDataType.NONE &&
                <div className='fixed pin-b pin-r mr-6 bg-white z-20 shadow-lg'>
                    <div className='flex justify-between border-b border-grey-lighter p-4 mb-2'>
                        <p
                            className='uppercase tracking-wide text-grey-darker text-base font-bold'>
                            {selectedDataType === SelectedDataType.ENTITY && 'Edit Entity'}
                            {selectedDataType === SelectedDataType.DOMAINS && 'Edit Domains'}
                            {selectedDataType === SelectedDataType.RELATION && 'Edit Relation'}
                        </p>
                        <MdClose onClick={_ => this.handleModelSelectionChange(SelectedDataType.NONE, undefined)}/>
                    </div>
                    <div className='p-2'>
                        {selectedDataType === SelectedDataType.ENTITY &&
                        <EntityEditor
                            model={model}
                            entity={this.getEditableDataForSelection(model, selectedDataType, selectedId!) as IEntity}
                            onEntityChange={this.handleEntityChange}
                            onEntityAttributeChange={this.handleEntityAttributeChange}
                            onEntityAttributeDomainChange={this.handleEntityAttributeDomainChange}
                            onEntityIdentifierChange={this.handleEntityIdentifierChange}
                            onEntityAttributeCreation={this.handleEntityAttributeCreation}
                            onEntityAttributeRemoval={this.handleEntityAttributeRemoval}
                        />}

                        {selectedDataType === SelectedDataType.DOMAINS &&
                        <DomainsEditor
                            domains={Object.values(model.domains)}
                            model={model}
                            onDomainChange={this.handleDomainChange}
                            onDomainRemoval={this.handleDomainRemoval}
                            onDomainCreation={this.handleDomainCreation}
                        />}

                        {selectedDataType === SelectedDataType.RELATION &&
                        <RelationEditor
                            relation={model.relations.find((x: IRelation) => x.id === selectedId)!}
                            model={model}
                            onRelationChange={this.handleRelationChange}
                            onRelationFromRefChange={this.handleRelationFromRefChange}
                            onRelationFromCardinalityChange={this.handleRelationFromCardinalityChange}
                            onRelationToRefChange={this.handleRelationToRefChange}
                            onRelationToCardinalityChange={this.handleRelationToCardinalityChange}
                        />}
                    </div>
                </div>}

                <div
                    style={{backgroundColor: '#f7f7f7'}}
                    className="flex flex-col flex-grow items-stretch min-h-screen"
                >
                    <div className="py-6 border-b border-grey-lighter pl-6 bg-white pr-6 relative">
                        <div className='flex justify-between items-center'>
                            <div className='flex items-center'>
                                <span className="text-2xl font-bold">DesignerWeb</span>

                                {hasLoadedModel && <span
                                    className="uppercase text-grey-darker font-bold cursor-pointer mr-6 inline-block cursor-pointer ml-12"
                                    onClick={_ => this.handleModelSelectionChange(SelectedDataType.DOMAINS)}>DOMAINS</span>}

                                {hasLoadedModel && <span
                                    className="uppercase text-grey-darker font-bold cursor-pointer mr-6 inline-block cursor-pointer ml-12"
                                    onClick={_ => this.createEntity('entity_1')}>ADD ENTITY</span>}
                            </div>
                            <div className='flex items-center'>
                                {hasLoadedModel && <span
                                    className="uppercase text-grey-darker font-bold cursor-pointer mr-6 inline-block cursor-pointer"
                                    onClick={this.downloadModel}>Export</span>}

                                <div className="upload-btn-wrapper cursor-pointer">
                                    <span
                                        className="uppercase text-grey-darker font-bold cursor-pointer upload-btn-wrapper__label">Import Model</span>
                                    <input type="file" className='upload-btn-wrapper__input' accept=".cdm,.pdm"
                                           onChange={this.handleModelImport}/>
                                </div>

                            </div>
                        </div>
                    </div>

                    <div id="diagram-window" className="pl-2 flex-grow flex flex-col relative"
                         onClick={_ => this.handleModelSelectionChange(SelectedDataType.NONE, undefined)}>
                        <ToastContainer autoClose={3000}/>

                        {model.entities.length > 0 && scaling === undefined &&
                        <SizingRenderer model={model}
                                        onDeterminedScale={(scaling) => this.setState({scaling})}/>
                        }

                        {model.entities.length > 0 && scaling !== undefined
                            ? <Diagram
                                model={model}
                                onModelSelectionChange={this.handleModelSelectionChange}
                                onEntityMoved={this.handleEntityMoved}
                                onRelationClicked={relation => this.handleModelSelectionChange(SelectedDataType.RELATION, relation.id)}
                                scaling={scaling!}/>
                            : <p> no Data</p>
                        }
                    </div>
                </div>
            </div>
        );
    }
}

export default App;
