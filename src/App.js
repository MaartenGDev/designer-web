import React, { Component } from 'react';
import xmlParser from './parsers/modelParser';
import data from './data/schema'
import Diagram from './components/Diagram';

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

  componentDidMount () {
    this.handleModelSourceChange();
  }

  toggleModelInput = () => {
    this.setState((state) => ({
      showModelInput: !state.showModelInput
    }));
  };

  handleModelSourceChange = evt => {
    xmlParser(data, (data) => {
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
          className={`bg-black z-20 justify-center items-center absolute w-screen h-screen pin ${showModelInput ? 'flex' : 'hidden'}`}>
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


          <div id="diagram-window" className="px-6 mt-12 flex-grow">
            {model.entities.length > 0 ? <Diagram model={model}/> : <p>No data</p>}
          </div>
        </div>
      </div>
    );
  }
}

export default App;
