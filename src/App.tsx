import * as React from 'react';
import {Component} from 'react';
import xmlParser from './parsers/modelParser';
import data from './data/schema'
import IModel from "./models/IModel";
import Diagram from "./components/Diagram";
import {SelectedDataType} from "./models/SelectedDataType";
import EntityEditor from "./components/editors/EntityEditor";
import {MdClose} from 'react-icons/md'
import CDMModel from "./parsers/CDMModel";
import IEntity from "./models/IEntity";

interface IProps {
}

interface IState {
    showModelInput: boolean,
    modelXml: string,
    model: IModel,
    selectedId: string | undefined,
    selectedDataType: SelectedDataType
}

class App extends Component<IProps, IState> {
    private CDMModel = new CDMModel();

    state = {
        showModelInput: false,
        modelXml: '',
        model: {
            entities: [],
            dataItems: {},
            relations: [],
            domains: {}
        },
        selectedId: undefined,
        selectedDataType: SelectedDataType.NONE
    };

    componentDidMount() {
        this.CDMModel.loadFromXml(data);

        this.handleModelSourceChange(data);
    }

    toggleModelInput = () => {
        this.setState((state) => ({
            showModelInput: !state.showModelInput
        }));
    };

    handleModelSourceChange = (xml: string) => {
        xmlParser(xml, (data: IModel) => {
            this.setState({
                model: data,
                modelXml: xml
            });
        });
    };

    handleModelSelectionChange = (selectedDataType: SelectedDataType, selectedId: string | undefined) => {
        this.setState({
            selectedId,
            selectedDataType
        });
    };

    private handleEntityChange = (entityId: string, attributeName: string, value: any) => {
        this.CDMModel.setAttributeForEntity(entityId, attributeName, value);
        this.handleModelSourceChange(this.CDMModel.getAsXml());
    };

    private handleEntityAttributeChange = (entityId: string, attributeId: string, dataItemId: string, nextDataType: string, nextDataTypeLength: number) => {
        this.CDMModel.setDataTypeAndLengthForDataItem(dataItemId, nextDataType, nextDataTypeLength);
        this.handleModelSourceChange(this.CDMModel.getAsXml());
    };

    private handleEntityAttributeDomainChange = (entityId: string, attributeId: string, dataItemId: string, nextDomainId: string) => {
        this.CDMModel.setDomainForDataItem(dataItemId, nextDomainId);
        this.handleModelSourceChange(this.CDMModel.getAsXml());
    };

    private getEditableDataForSelection = (model: IModel, selectedDataType: SelectedDataType, selectedId: string): IEntity | undefined => {
        if(selectedDataType === SelectedDataType.NONE) return undefined;

        if(selectedDataType === SelectedDataType.ENTITY) return model.entities.find(x => x.id === selectedId);

        return undefined
    };

    render() {
        const {showModelInput, model, selectedDataType, selectedId, modelXml} = this.state;

        return (
            <div className="relative w-full">
                <div
                    className={`bg-black z-30 justify-center items-center absolute w-screen h-screen pin ${showModelInput ? 'flex' : 'hidden'}`}>
                    <div className='w-1/2 bg-white flex flex-col' style={{height: 'calc(100vh - 60px)'}}>
                        <div
                            className='p-4 border-b border-grey-lighter font-bold text-grey-darker flex justify-between items-center'>
                            <span className='text-xl'>Model</span>
                            <button onClick={this.toggleModelInput}>Close</button>
                        </div>
                        <textarea className='w-full flex-grow'
                                  onChange={e => this.handleModelSourceChange(e.target.value)} value={modelXml}/>
                    </div>
                </div>
                {selectedDataType !== SelectedDataType.NONE &&
                <div className='fixed pin-b pin-r mr-6 bg-white z-20 shadow-lg'>
                  <div className='flex justify-between border-b border-grey-lighter p-4 mb-2'>
                    <p
                      className='uppercase tracking-wide text-grey-darker text-base font-bold'>
                      Edit Entity
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
                        onEntityIdentifierChange={e => {}}
                      />}
                  </div>
                </div>}

                <div
                    style={{backgroundColor: '#f7f7f7'}}
                    className="flex flex-col flex-grow items-stretch min-h-screen"
                >
                    <div className="py-6 border-b border-grey-lighter pl-6 bg-white pr-6">
                        <div className='flex justify-between items-center'>
                            <span className="text-2xl font-bold">DesignerWeb</span>
                            <span className="uppercase text-grey-darker font-bold cursor-pointer"
                                  onClick={this.toggleModelInput}>View Model</span>
                        </div>
                    </div>

                    <div id="diagram-window" className="px-6 mt-12 flex-grow"
                         onClick={_ => this.handleModelSelectionChange(SelectedDataType.NONE, undefined)}>
                        {model.entities.length > 0
                            ? <Diagram model={model} onModelSelectionChange={this.handleModelSelectionChange}/>
                            : <p>No data</p>}
                    </div>
                </div>
            </div>
        );
    }
}

export default App;
