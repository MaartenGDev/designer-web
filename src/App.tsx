import * as React from "react";
import {useState} from "react";
import {DataModelEditor} from "./DataModelEditor";

export const App = () => {
    const [modelLoadSettings, setModelLoadSetting] = useState({
        landingDismissed: false,
        modelFile: {},
        isImport: false,
        isDemo: false,
        isNew: false
    });

    const handleModelImport = (e: { target: HTMLInputElement }) => {
        if (e.target.files === null || e.target.files.length === 0) return;

        setModelLoadSetting({
            landingDismissed: true,
            modelFile: e.target.files[0],
            isImport: true,
            isDemo: false,
            isNew: false
        });
    };

    const loadDemo = () => {
        setModelLoadSetting({
            landingDismissed: true,
            modelFile: {},
            isImport: false,
            isDemo: true,
            isNew: false
        });
    };

    const loadNew = () => {
        setModelLoadSetting({
            landingDismissed: true,
            modelFile: {},
            isImport: false,
            isDemo: false,
            isNew: true
        });
    };

    const navigateHome = () => {
        setModelLoadSetting({
            landingDismissed: false,
            modelFile: {},
            isImport: false,
            isDemo: false,
            isNew: false
        });
    };

    return <>
        {!modelLoadSettings.landingDismissed && <div className='min-h-screen pb-20'>
            <div
                style={{background: 'linear-gradient(90deg, rgba(2,0,36,1) 0%, rgba(37,37,121,1) 30%, rgba(0,212,255,1) 100%)'}}>
                <div className='mx-auto'
                     style={{paddingTop: '200px', maxWidth: 'calc(100% - 40px)', width: 'calc(100% - 400px)'}}>
                    <div className='text-center'>
                        <h1 className='text-white font-light' style={{fontSize: '3em'}}>DesignerWeb</h1>
                        <p className='text-white text-2xl font-light mt-6'>The modern way to model data</p>
                    </div>

                    <div className='flex justify-center mt-12 w-full'>
                        <div className='p-4 bg-white rounded shadow-md max-w-xs flex flex-col justify-between'
                             style={{marginBottom: '-50px'}}>
                            <div>
                                <div className="text-grey-darkest font-bold text-xl mb-2">Import Model</div>
                                <p className="text-grey-darker text-base">
                                    Import a already existing model and start editing in seconds! All major external
                                    tools
                                    are supported.
                                </p>
                            </div>
                            <div className="upload-btn-wrapper cursor-pointer mt-4 w-full">
                            <span
                                className="btn btn--purple w-full cursor-pointer">Import</span>
                                <input type="file" className='upload-btn-wrapper__input' accept=".cdm,.pdm"
                                       onChange={e => handleModelImport(e)}/>
                            </div>
                        </div>
                        <div className='p-4 bg-white rounded max-w-xs shadow-md mx-4 flex flex-col justify-between'
                             style={{marginBottom: '-50px'}}>
                            <div>
                                <div className="text-grey-darkest font-bold text-xl mb-2">Demo</div>
                                <p className="text-grey-darker text-base">
                                    A demo area has been configured to give a look and feel of the tool. Feel free to
                                    edit
                                    and export what you want.
                                </p>
                            </div>
                            <button className='btn btn--red w-full p-2 mt-4' onClick={loadDemo}>Try it</button>
                        </div>
                        <div className='p-4 bg-white rounded max-w-xs shadow-md flex flex-col justify-between' style={{marginBottom: '-50px'}}>
                            <div>
                                <div className="text-grey-darkest font-bold text-xl mb-2">Create model</div>
                                <p className="text-grey-darker text-base">
                                    By creating a model from scratch you can start with a clean slate and later export
                                    it to
                                    all majors external tools.
                                </p>
                            </div>
                            <button className='btn btn--teal w-full mt-4' onClick={loadNew}>Create</button>
                        </div>
                    </div>
                </div>
            </div>
            <div className='mx-auto' style={{marginTop: '10rem', maxWidth: 'calc(100% - 40px)', width: '63rem'}}>
                <h1 className='text-center text-grey-darkest font-normal'>FREQUENTLY ASKED QUESTIONS</h1>
                <div className='flex mt-16'>
                    <div>
                        <div>
                            <p className="text-grey-darkest font-bold text-lg mb-2">What models are supported?</p>
                            <p className="text-grey-darker text-base">Models created based on CDM(Conceptual Data Model)
                                and PDM(Physical Data Model)
                                structures are supported. Converting between the two will be supported in the
                                future.</p>
                        </div>
                        <div className='mt-6'>
                            <p className="text-grey-darkest font-bold text-lg mb-2">Is it possible to switch between
                                programs?</p>
                            <p className="text-grey-darker text-base">Yes! This editors conforms to the data model
                                standard and you can keep editing the model
                                in all supported external programs. Switch on any moment using the export/import
                                features.</p>
                        </div>
                        <div className='mt-6'>
                            <p className="text-grey-darkest font-bold text-lg mb-2">What tools/libraries are used in
                                this project?</p>
                            <p className="text-grey-darker text-base">This project has been configured with <a
                                href='https://create-react-app.dev/docs/getting-started'
                                className='text-blue underline' target='_blank' rel='noopener noreferrer'>Create React
                                App</a>.
                                Typescript
                                has been added for type-safety. <a href='http://tailwindcss.com/'
                                                                   className='text-blue underline' target='_blank'
                                                                   rel='noopener noreferrer'>Tailwind</a> is the
                                css
                                library of choice for the styling. Check out the <a
                                    href='https://github.com/MaartenGDev/designer-web' className='text-blue underline'
                                    target='_blank' rel='noopener noreferrer'>source code</a> for more details.</p>
                        </div>
                    </div>
                    <div className='ml-10'>
                        <div>
                            <p className="text-grey-darkest font-bold text-lg mb-2">Why is this different from the
                                alternatives?</p>
                            <p className="text-grey-darker text-base">The alternatives are created for specific
                                platforms such as Windows. This project is web based and thus suitable for every
                                platform with a browser!</p>
                        </div>
                        <div className='mt-6'>
                            <p className="text-grey-darkest font-bold text-lg mb-2">Is it possible to work together on a
                                project?</p>
                            <p className="text-grey-darker text-base">Not yet, multi-user editing will be supported in
                                the future because it will be quite easy to implement using websockets on this web
                                platform.</p>
                        </div>
                        <div className='mt-6'>
                            <p className="text-grey-darkest font-bold text-lg mb-2">Why was this project created?</p>
                            <p className="text-grey-darker text-base">Most modeling programs are only made for Windows
                                based platforms. To be able to model on multiple platforms without spinning up an VM
                                this project has been created.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>}
        {modelLoadSettings.landingDismissed && <DataModelEditor
            importModelFromFile={modelLoadSettings.isImport}
            modelFile={modelLoadSettings.modelFile as File}
            loadDemo={modelLoadSettings.isDemo}
            createNewModel={modelLoadSettings.isNew}
            navigateToHome={navigateHome}
        />}
    </>
};