import * as React from 'react';
import {Component} from 'react';
import xmlParser from './parsers/modelParser';
import IModel from "./models/IModel";
import {SelectedDataType} from "./models/SelectedDataType";
import EntityEditor from "./components/editors/EntityEditor";
import DataModel from "./parsers/DataModel";
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
import RelationEditor from "./components/editors/RelationEditor";
import IRelation from "./models/IRelation";
import {DEMO_MODEL_XML} from "./data/demo";
import {EMPTY_MODEL_XML} from "./data/emptyModel";
import {MdLayers, MdLocalOffer, MdLabel, MdClose, MdMenu} from 'react-icons/md'

interface IProps {
    modelFile?: File;
    importModelFromFile: boolean;
    loadDemo: boolean;
    createNewModel: boolean;
    navigateToHome: () => void
}

interface IState {
    modelXml: string,
    model: IModel,
    selectedId: string | undefined,
    scaling: Scaling | undefined,
    menuIsCollapsed: boolean,
    selectedDataType: SelectedDataType,
    newItemCount: number
}

export class DataModelEditor extends Component<IProps, IState> {
    private dataModel = new DataModel();

    state = {
        modelXml: '',
        model: {
            entities: [],
            dataItems: {},
            relations: [],
            domains: {}
        },
        menuIsCollapsed: false,
        scaling: undefined,
        selectedId: undefined,
        selectedDataType: SelectedDataType.NONE,
        newItemCount: 0
    };

    componentDidMount(): void {
        const {modelFile, importModelFromFile, loadDemo, createNewModel} = this.props;

        if (importModelFromFile) {
            this.importFromFile(modelFile!);
        }

        if (loadDemo) {
            this.loadDemo();
        }

        if (createNewModel) {
            this.loadNewModel();
        }
    }

    loadDemo() {
        this.dataModel.loadFromXml(DEMO_MODEL_XML);
        this.handleModelSourceChange(DEMO_MODEL_XML);
    }

    loadNewModel() {
        this.dataModel.loadFromXml(EMPTY_MODEL_XML);
        this.handleModelSourceChange(EMPTY_MODEL_XML);
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

    private createEntity = () => {
        this.setState({
            newItemCount: this.state.newItemCount + 1
        });

        this.dataModel.createEntity(`entity_${this.state.newItemCount}`, this.state.newItemCount);
        this.handleModelSourceChange(this.dataModel.getAsXml());
    };

    private handleEntityChange = (entityId: string, attributeName: string, value: any) => {
        this.dataModel.setAttributeForEntity(entityId, attributeName, value);
        this.handleModelSourceChange(this.dataModel.getAsXml());
    };

    private handleEntityAttributeChange = (entityId: string, attributeId: string, dataItemId: string, nextDataType: string, nextDataTypeLength: number) => {
        this.dataModel.setDataTypeAndLengthForDataItem(dataItemId, nextDataType, nextDataTypeLength);
        this.handleModelSourceChange(this.dataModel.getAsXml());
    };

    private handleEntityAttributeCreation = (entityId: string, name: string, dataType: string, length: number) => {
        this.dataModel.createAttributeForEntity(entityId, name, dataType, length);
        this.handleModelSourceChange(this.dataModel.getAsXml());
    };

    private handleEntityAttributeRemoval = (entityId: string, attributeId: string) => {
        this.dataModel.removeAttributeForEntity(entityId, attributeId);
        this.handleModelSourceChange(this.dataModel.getAsXml());
    };

    private handleEntityAttributeDomainChange = (entityId: string, attributeId: string, dataItemId: string, nextDomainId: string) => {
        this.dataModel.setDomainForDataItem(dataItemId, nextDomainId);
        this.handleModelSourceChange(this.dataModel.getAsXml());
    };

    private handleEntityIdentifierChange = (entityId: string, changeAction: EntityIdentifierChangeAction, attributeId: string) => {
        if (changeAction === EntityIdentifierChangeAction.NONE) {
            this.dataModel.removeIdentifierForEntity(entityId, attributeId);
        }

        if (changeAction === EntityIdentifierChangeAction.REGULAR || changeAction === EntityIdentifierChangeAction.PRIMARY) {
            this.dataModel.addIdentifierForEntity(entityId, attributeId, changeAction === EntityIdentifierChangeAction.PRIMARY);
        }

        this.handleModelSourceChange(this.dataModel.getAsXml());
    };

    private handleEntityDelete = (entityId: string) => {
        this.dataModel.deleteEntity(entityId);
        this.handleModelSelectionChange(SelectedDataType.NONE, undefined);
        this.handleModelSourceChange(this.dataModel.getAsXml());
    };

    private handleDomainChange = (domainId: string, name: string, dataType: string, length: number) => {
        this.dataModel.setDataTypeAndLengthForDomain(domainId, name, dataType, length);
        this.handleModelSourceChange(this.dataModel.getAsXml());
    };

    private handleDomainRemoval = (domainId: string) => {
        if (this.dataModel.removeDomain(domainId)) {
            return this.handleModelSourceChange(this.dataModel.getAsXml());
        }

        toast.error('Failed to delete domain, there are entities using this domain.');
    };

    private handleDomainCreation = (name: string, dataType: string, length: number) => {
        this.dataModel.createDomain(name, dataType, length);
        this.handleModelSourceChange(this.dataModel.getAsXml());
    };

    private handleEntityMoved = (entityId: string, nextCoordinates: IRectangleCoordinates) => {
        this.dataModel.moveEntity(entityId, nextCoordinates);
        this.handleModelSourceChange(this.dataModel.getAsXml());
    };


    private handleRelationChange = (relationId: string, attributeName: string, value: any) => {
        this.dataModel.setAttributeForRelation(relationId, attributeName, value);
        this.handleModelSourceChange(this.dataModel.getAsXml());
    };

    private handleRelationFromRefChange = (relationId: string, targetEntityId: string) => {
        this.dataModel.setFromRefOfRelation(relationId, targetEntityId);
        this.handleModelSourceChange(this.dataModel.getAsXml());
    };

    private handleRelationToRefChange = (relationId: string, targetEntityId: string) => {
        this.dataModel.setToRefOfRelation(relationId, targetEntityId);
        this.handleModelSourceChange(this.dataModel.getAsXml());
    };

    private handleRelationFromCardinalityChange = (relationId: string, nextCardinality: string) => {
        this.dataModel.setFromCardinalityOfRelation(relationId, nextCardinality);
        this.handleModelSourceChange(this.dataModel.getAsXml());
    };

    private handleRelationToCardinalityChange = (relationId: string, nextCardinality: string) => {
        this.dataModel.setToCardinalityOfRelation(relationId, nextCardinality);
        this.handleModelSourceChange(this.dataModel.getAsXml());
    };

    private handleRelationDelete = (relationId: string) => {
        this.dataModel.deleteRelation(relationId);
        this.handleModelSelectionChange(SelectedDataType.NONE, undefined);
        this.handleModelSourceChange(this.dataModel.getAsXml());
    };

    private handleRelationCreated = (sourceEntityId: string, targetEntityId: string) => {
        const {model} = this.state;
        const sourceEntityName = (model.entities.find((x: IEntity) => x.id === sourceEntityId)! as IEntity).name;
        const targetEntityName = (model.entities.find((x: IEntity) => x.id === targetEntityId)! as IEntity).name;

        this.dataModel.createRelation(sourceEntityId, targetEntityId, `${sourceEntityName}_OF_${targetEntityName}`, '1,1');
        this.handleModelSourceChange(this.dataModel.getAsXml());
    };

    private getEditableDataForSelection = (model: IModel, selectedDataType: SelectedDataType, selectedId: string): IEntity | undefined => {
        if (selectedDataType === SelectedDataType.NONE) return undefined;
        if (selectedDataType === SelectedDataType.ENTITY) return model.entities.find(x => x.id === selectedId);

        return undefined
    };

    /**
     * TODO: remove unused method
     */
    private downloadModel = () => {
        const data = this.dataModel.getAsXml();

        DownloadHelper.downloadAsFile('model.cdm', data)
    };

    private importFromFile = (file: File) => {
        const reader = new FileReader();

        reader.onload = () => {
            if (reader.result === null) return;
            const result = reader.result.toString();

            this.dataModel.loadFromXml(result);
            this.handleModelSourceChange(result);
        };

        reader.readAsText(file)
    };

    render() {
        const {
            model,
            selectedDataType,
            selectedId,
            scaling,
            menuIsCollapsed
        } = this.state;

        const {
            navigateToHome
        } = this.props

        // Editor View
        return (
            <div className="relative w-full">
                {/* Edit Popup */}
                {selectedDataType !== SelectedDataType.NONE &&
                <div className='fixed pin-b pin-r mr-6 bg-white z-20 shadow-lg'>
                    {/* Title */}
                    <div className='flex justify-between border-b border-grey-lighter p-4 mb-2'>
                        <p className='uppercase tracking-wide text-grey-darker text-base font-bold'>
                            {selectedDataType === SelectedDataType.ENTITY && 'Edit Entity'}
                            {selectedDataType === SelectedDataType.DOMAINS && 'Edit Domains'}
                            {selectedDataType === SelectedDataType.RELATION && 'Edit Relation'}
                        </p>

                        <MdClose onClick={_ => this.handleModelSelectionChange(SelectedDataType.NONE, undefined)}/>
                    </div>

                    {/* Body */}
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
                            onEntityDelete={this.handleEntityDelete}
                            onDismiss={() => this.handleModelSelectionChange(SelectedDataType.NONE, undefined)}
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
                            onRelationDelete={this.handleRelationDelete}
                            onRelationChange={this.handleRelationChange}
                            onRelationFromRefChange={this.handleRelationFromRefChange}
                            onRelationFromCardinalityChange={this.handleRelationFromCardinalityChange}
                            onRelationToRefChange={this.handleRelationToRefChange}
                            onRelationToCardinalityChange={this.handleRelationToCardinalityChange}
                            onDismiss={() => this.handleModelSelectionChange(SelectedDataType.NONE, undefined)}
                        />}
                    </div>
                </div>}

                <div style={{backgroundColor: '#f7f7f7'}} className="flex flex-grow items-stretch min-h-screen">
                    {/* Sidebar */}
                    <div className="border-b border-grey-lighter bg-white relative">
                        <div className='py-4 px-6 border-b border-grey-light flex justify-between items-center'>
                            {!menuIsCollapsed && <span className='text-xl font-bold m-0 text-grey-darker'>Editor</span>}
                            {!menuIsCollapsed && <MdClose className='text-xl text-grey-darker' onClick={x => this.setState({menuIsCollapsed: true})}/>}
                            {menuIsCollapsed && <MdMenu className='text-xl text-grey-darker' onClick={x => this.setState({menuIsCollapsed: false})}/>}
                        </div>

                        {!menuIsCollapsed && <div>
                            <div className='mt-6 px-6'>
                                <span className='block uppercase tracking-wide text-grey-darker text-xs font-bold mb-2'>
                                    Data
                                </span>

                                <ul className='m-0 mt-2 list-reset text-grey-dark'>
                                    <li className='text-md mb-2 cursor-pointer'>
                                        <span className='no-underline flex items-center' onClick={_ => this.handleModelSelectionChange(SelectedDataType.DOMAINS)}>
                                            <MdLocalOffer/>
                                            <span className='ml-2'>Domains</span>
                                        </span>
                                    </li>
                                    <li className='text-md mb-2 cursor-pointer'>
                                        <span className='no-underline flex items-center' onClick={_ => this.createEntity()}>
                                            <MdLayers/>
                                            <span className='ml-2'>Add entity</span>
                                        </span>
                                    </li>
                                </ul>
                            </div>

                            <div className='mt-6 px-6'>
                                <span className='block uppercase tracking-wide text-grey-darker text-xs font-bold mb-2'>
                                    Navigation
                                </span>

                                <ul className='m-0 mt-2 list-reset text-grey-dark'>
                                    <li className='text-md mb-2 cursor-pointer'>
                                        <span className='no-underline flex items-center' onClick={navigateToHome}>
                                            <MdLabel/>
                                            <span className='ml-2'>Back to home</span>
                                        </span>
                                    </li>
                                </ul>
                            </div>
                        </div>}
                    </div>

                    {/* Diagram Container */}
                    <div id="diagram-window" className="pl-2 pt-4 flex-grow flex flex-col relative"
                        onClick={_ => this.handleModelSelectionChange(SelectedDataType.NONE, undefined)}>
                        <ToastContainer autoClose={3000}/>

                        {model.entities.length > 0 && scaling === undefined &&
                            <SizingRenderer model={model} onDeterminedScale={(scaling) => this.setState({scaling})}/>
                        }

                        {model.entities.length > 0 && scaling !== undefined
                            ? <Diagram
                                model={model}
                                onModelSelectionChange={this.handleModelSelectionChange}
                                onEntityMoved={this.handleEntityMoved}
                                onRelationClicked={relation => this.handleModelSelectionChange(SelectedDataType.RELATION, relation.id)}
                                onRelationCreated={this.handleRelationCreated}
                                scaling={scaling!}/>
                            : null
                        }
                    </div>
                </div>
            </div>
        );
    }
}