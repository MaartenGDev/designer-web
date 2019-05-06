import React, {Component} from 'react';
import IModel from "../../models/IModel";
import IDomain from "../../models/IDomain";
import {DataTypeHelper} from "../../helpers/DataTypeHelper";

interface IProps {
    domains: IDomain[],
    model: IModel,
    onDomainChange: (domainId: string, name: string, dataType: string, length: number) => void
    onDomainRemoval: (domainId: string) => void,
    onDomainCreation: (name: string, dataType: string, length: number) => void,
}

interface IState {
}


class DomainsEditor extends Component<IProps, IState> {
    state = {};


    render() {
        const {domains, onDomainChange, onDomainRemoval, onDomainCreation} = this.props;

        return (
            <div>
                <div className="w-full">
                    <div className='flex'>
                        <span className="form__label">
                            Domains
                        </span>
                        <span className="form__label form__label--green ml-2 cursor-pointer inline-block" onClick={e => onDomainCreation('DOMAIN_1', 'VA', 255)}>
                            Add
                        </span>
                    </div>
                    <div className='max-h-md overflow-y-auto'>
                    <table className='w-full text-left table-collapse'>
                        <tbody className='align-baseline'>
                        <tr>
                            <th className='table__header'>Name</th>
                            <th className='table__header'>Data type</th>
                            <th className='table__header'>Length</th>
                            <th className='table__header'>Remove</th>
                        </tr>
                        {domains.map(domain => {
                            return <tr key={domain.id}>
                                <td className='table__cell'>
                                    <input type='text'
                                           className='form__input'
                                           onChange={e => onDomainChange(domain.id, e.target.value, domain.dataType, domain.length)}
                                           value={domain.name}/>

                                </td>
                                <td className='table__cell'>
                                    <select className='form__input form__input--select'
                                            value={DataTypeHelper.getDataTypeWithoutLength(domain.dataType)}
                                            onChange={e => onDomainChange(domain.id, domain.name, e.target.value, domain.length)}>
                                        {Object.keys(DataTypeHelper.allTypes()).map((type: string) => <option key={type}
                                                                                                              value={type}>{DataTypeHelper.getLabelForDataType(type)}</option>)}
                                    </select>
                                </td>

                                <td className='p-2 border-t border-grey-light  text-xs'>
                                    <input type='number'
                                           className='form__input'
                                           onChange={e => onDomainChange(domain.id, domain.name, domain.dataType, parseInt(e.target.value, 10))}
                                           value={domain.length}/>
                                </td>

                                <td className="table__cell">
                                        <span className="form__label form__label--red ml-2"
                                              onClick={e => onDomainRemoval(domain.id)}>Remove</span>
                                </td>
                            </tr>
                        })}
                        </tbody>
                    </table>
                </div>
                </div>
            </div>
        )
    };
}

export default DomainsEditor;
