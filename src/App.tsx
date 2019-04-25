import React, { Component } from 'react';
import xmlParser from './parsers/modelParser';
import { MdKeyboardArrowRight } from 'react-icons/md'

class App extends Component {
  state = {
    showModelInput: false,
    modelXml: '',
    model: {
      entities: [],
      attributes: {},
      relations: []
    }
  };

  toggleModelInput = () => {
    this.setState((state) => ({
      showModelInput: !state.showModelInput
    }));
  };

  handleModelSourceChange = evt => {
    xmlParser(evt.target.value, (data) => {
      this.setState({
        model: data
      });
    });
  };

  render () {
    const {showModelInput, model} = this.state;

    return (
      <div className="relative w-full">
        <div
          className={`bg-black z-10 justify-center items-center absolute w-screen h-screen pin ${showModelInput ? 'flex' : 'hidden'}`}>
          <div className='w-1/2 bg-white flex flex-col' style={{height: 'calc(100vh - 60px)'}}>
            <div
              className='p-4 border-b border-grey-lighter font-bold text-grey-darker flex justify-between items-center'>
              <span className='text-xl'>Model</span>
              <button onClick={this.toggleModelInput}>Close</button>
            </div>
            <textarea className='w-full flex-grow' onChange={this.handleModelSourceChange}>

            </textarea>
          </div>
        </div>

        <div
          style={{backgroundColor: '#f7f7f7'}}
          className="flex flex-col flex-grow items-stretch min-h-screen"
        >
          <div className="py-6 border-b border-grey-lighter pl-6 bg-white pr-6">
            <div className='flex justify-between items-center'>
              <span className="text-2xl font-bold">DesignerWeb</span>
              <span className="uppercase text-grey-darker font-bold cursor-pointer" onClick={this.toggleModelInput}>View Model</span>
            </div>
          </div>


          <div className="px-6 mt-12">
            {model.entities.map(entity => {
              return <div className='bg-white mb-6'>
                <div className="p-4 border-b border-grey-lighter font-bold text-grey-darker">
                  <span>{entity.name}</span>
                </div>
                <div className='p-4 bg-white'>
                  <ul>
                    {entity.attributeIds.map(attributeId => {
                      return <li>{model.attributes[attributeId].name}</li>;
                    })}
                  </ul>

                  <div className='mt-6'>
                  {model.relations.filter(x => x.from === entity.id).map(relation => {
                    return <span className='inline-block bg-grey-lighter rounded-full px-3 py-1 text-sm font-semibold text-grey-darker mr-2 mb-2'>{model.entities.find(x => x.id === relation.from).name}<MdKeyboardArrowRight size='1.5em' className='align-middle'/>{model.entities.find(x => x.id === relation.to).name}<i>({relation.name})</i></span>
                  })}
                  </div>
                </div>
              </div>;
            })}
          </div>
        </div>
      </div>
    );
  }
}

export default App;
