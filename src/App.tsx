import * as React from "react";
import {useState} from "react";
import {DataModelEditor} from "./DataModelEditor";

export const App = () => {
    const [isLandingPage, toggleLanding] = useState(true);
    return <>
        {isLandingPage && <div className='min-h-screen'>
            <div
                style={{background: 'linear-gradient(90deg, rgba(2,0,36,1) 0%, rgba(37,37,121,1) 30%, rgba(0,212,255,1) 100%)'}}>
                <div className='mx-auto'
                     style={{paddingTop: '200px', maxWidth: 'calc(100% - 40px)', width: 'calc(100% - 400px)'}}>
                    <div className='text-center'>
                        <h1 className='text-white font-light' style={{fontSize: '3em'}}>DesignerWeb</h1>
                        <p className='text-white text-2xl font-light mt-6'>The modern way to model data!</p>
                    </div>

                    <div className='flex justify-center mt-12 w-full'>
                        <div className='p-4 bg-white rounded shadow-md max-w-xs' style={{marginBottom: '-50px'}}>
                            <div className="text-grey-darkest font-bold text-xl mb-2">Import Model</div>
                            <p className="text-grey-darker text-base">
                                Import a already existing model and start editing in seconds!
                            </p>
                        </div>
                        <div className='p-4 bg-white rounded max-w-xs shadow-md mx-4' style={{marginBottom: '-50px'}}>
                            <div className="text-grey-darkest font-bold text-xl mb-2">Create model</div>
                            <p className="text-grey-darker text-base">
                                By creating a model from scratch you can start with a clean slate and later export it to
                                all majors external tools.
                            </p>
                        </div>
                        <div className='p-4 bg-white rounded max-w-xs shadow-md' style={{marginBottom: '-50px'}}>
                            <div className="text-grey-darkest font-bold text-xl mb-2">Contribute</div>
                            <p className="text-grey-darker text-base">
                                This is a project created in my time off, all code is open-source so please, take a look
                                around :)
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            <div className='mx-auto'  style={{marginTop: '10rem', maxWidth: 'calc(100% - 40px)', width: '63rem'}}>
                <h1 className='text-center text-grey-darkest font-normal'>FREQUENTLY ASKED QUESTIONS</h1>
                <div className='flex mt-16'>
                    <div>
                        <div>
                            <p className="text-grey-darkest font-bold text-lg mb-2">What models are supported?</p>
                            <p className="text-grey-darker text-base">Models created based on CDM(Conceptual Data Model) and PDM(Physical Data Model)
                                structures
                                are supported!</p>
                        </div>
                        <div className='mt-6'>
                            <p className="text-grey-darkest font-bold text-lg mb-2">Is it possible to switch between programs?</p>
                            <p className="text-grey-darker text-base">Yes! This editors conforms to the data model standard and you can keep editing the model
                                in
                                all supported external programs!</p>
                        </div>
                        <div className='mt-6'>
                            <p className="text-grey-darkest font-bold text-lg mb-2">What tools/libraries are used in this project?</p>
                            <p className="text-grey-darker text-base">This project has been configured with <a
                                href={"https://create-react-app.dev/docs/getting-started"}>Create React App</a>.
                                Typescript
                                has been added for type-safety. <a href='http://tailwindcss.com/'>Tailwind</a> is the
                                css
                                library of choice for the styling</p>
                        </div>
                    </div>
                    <div className='ml-10'>
                        <div>
                            <p className="text-grey-darkest font-bold text-lg mb-2">What models are supported?</p>
                            <p className="text-grey-darker text-base">Models created based on CDM(Conceptual Data Model) and PDM(Physical Data Model)
                                structures
                                are supported!</p>
                        </div>
                        <div className='mt-6'>
                            <p className="text-grey-darkest font-bold text-lg mb-2">Is it possible to switch between programs?</p>
                            <p className="text-grey-darker text-base">Yes! This editors conforms to the data model standard and you can keep editing the model
                                in
                                all supported external programs!</p>
                        </div>
                        <div className='mt-6'>
                            <p className="text-grey-darkest font-bold text-lg mb-2">What tools/libraries are used in this project?</p>
                            <p className="text-grey-darker text-base">This project has been configured with <a
                                href={"https://create-react-app.dev/docs/getting-started"}>Create React App</a>.
                                Typescript
                                has been added for type-safety. <a href='http://tailwindcss.com/'>Tailwind</a> is the
                                css
                                library of choice for the styling</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>}
        {!isLandingPage && <DataModelEditor/>}
    </>
};