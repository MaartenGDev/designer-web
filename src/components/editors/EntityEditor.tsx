import React from 'react';
import PropTypes from 'prop-types';
import IEntity from "../../models/IEntity";
import IModel from "../../models/IModel";
import {SelectedDataType} from "../../models/SelectedDataType";

interface IProps {
    entity: IEntity,
    model: IModel
}

const dataTypesById: {[key: string]: string} = {
    "I": "Integer",
    "N": "Number",
    "DC": "Decimal",
    "F": "Float",
    "MN": "Money",
    "BL": "Boolean",
    "A": "Characters",
    "VA": "Variable Characters",
    "LA": "Long Characters",
    "LVA": "Long Variable Characters",
    "TXT": "Text",
    "BT": "Bytes",
    "MBT": "Multibyte",
    "D": "Date",
    "T": "Time",
    "DT": "Date & Time",
    "TS": "Timestamp",
    "BIN": "Binary",
    "VBIN": "Variable Binary",
    "LBIN": "Long Binary",
    "": "Undefined"
};

const getLabelForDataType = (dataType: string): string => {
    return dataTypesById[dataType.replace(/[0-9]/g, '')]
};

const EntityEditor = ({entity, model}: IProps) => {
    const domainOptions = Object.values(model.domains).map(domain => ({id: domain.id, label: `${domain.name}(${getLabelForDataType(domain.dataType)})`}));

    return (
        <div>
            <table>
                <tbody>
                <tr>
                    <th>Name</th>
                    <th>Data type</th>
                    <th>Length</th>
                    <th>Domain</th>
                    <th>Length</th>
                    <th>Identifier</th>
                </tr>
                {entity.attributeIds.map(attributeId => {
                    const isPrimaryIdentifier = model.attributes[attributeId].domainId !== undefined && model.domains[model.attributes[attributeId].domainId!].dataType === 'I';

                    return <tr>
                        <td className='pr-2'>{model.attributes[attributeId].name}</td>
                        <td className='pr-2'>
                            <select>
                                {Object.keys(dataTypesById).map((type: string)=> <option selected={type === model.attributes[attributeId].dataType}>{getLabelForDataType(type)}</option>)}
                            </select>
                        </td>
                        <td><input type='number' value={model.attributes[attributeId].length}/></td>
                        <td className='pl-2'>
                            <select>
                                <option selected={model.attributes[attributeId].domainId === undefined}>None</option>
                                {domainOptions.map(domain => <option selected={domain.id === model.attributes[attributeId].domainId}>{domain.label}</option>)}
                            </select>
                        </td>
                        <td><input type='number' value={model.attributes[attributeId].domainId === undefined ? 0 : (model.domains[model.attributes[attributeId].domainId!].length || undefined)}/></td>
                        <td><input type='checkbox' checked={isPrimaryIdentifier}/></td>
                    </tr>
                })}
                </tbody>
            </table>
        </div>
    );
};

export default EntityEditor;
