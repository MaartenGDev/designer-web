import * as React from 'react';
import {Component} from 'react';
import xmlParser from './parsers/modelParser';
import data from './data/schema'
import IModel from "./models/IModel";
import Diagram from "./components/Diagram";
import {SelectedDataType} from "./models/SelectedDataType";
import IEntity from "./models/IEntity";
import EntityEditor from "./components/editors/EntityEditor";
import { MdClose } from 'react-icons/md'

interface IProps {
}

interface IState {
    showModelInput: boolean,
    modelXml: string,
    model: IModel,
    editableData: IEntity | undefined,
    selectedDataType: SelectedDataType | undefined
}

class App extends Component<IProps, IState> {
    state = {
        showModelInput: false,
        modelXml: '',
        model: {
            entities: [],
            attributes: {},
            relations: [],
            domains: {}
        },
        editableData: undefined,
        selectedDataType: undefined
    };

    componentDidMount() {
        this.handleModelSourceChange({target: {value: data}});
    }

    toggleModelInput = () => {
        this.setState((state) => ({
            showModelInput: !state.showModelInput
        }));
    };

    handleModelSourceChange = (evt: any) => {
        xmlParser(evt.target.value, (data: IModel) => {
            this.setState({
                model: data
            });
        });
    };

    handleModelSelectionChange = (selectedDataType: SelectedDataType, editableData: IEntity | undefined) => {
        console.log('oeff')
        this.setState({
            editableData,
            selectedDataType
        });
    };

    render() {
        const {showModelInput, model, editableData, selectedDataType} = this.state;

        return (
            <div className="relative w-full">
                <div
                    className={`bg-black z-20 justify-center items-center absolute w-screen h-screen pin ${showModelInput ? 'flex' : 'hidden'}`}>
                    <div className='w-1/2 bg-white flex flex-col' style={{height: 'calc(100vh - 60px)'}}>
                        <div
                            className='p-4 border-b border-grey-lighter font-bold text-grey-darker flex justify-between items-center'>
                            <span className='text-xl'>Model</span>
                            <button onClick={this.toggleModelInput}>Close</button>
                        </div>
                        <textarea className='w-full flex-grow' onChange={this.handleModelSourceChange}/>
                    </div>
                </div>
                {editableData !== undefined && <div className='fixed pin-b pin-r mr-6 bg-white z-20 shadow-lg'>
                  <div className='flex justify-between border-b border-grey-lighter p-4 mb-2'>
                    <p
                      className='uppercase tracking-wide text-grey-darker text-base font-bold'>
                      Edit Entity
                    </p>
                    <MdClose onClick={_ => this.handleModelSelectionChange(SelectedDataType.NONE, undefined)}/>
                  </div>
                  <div className='p-2'>
                      {selectedDataType === SelectedDataType.ENTITY &&
                      <EntityEditor model={model} entity={editableData}/>}
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
