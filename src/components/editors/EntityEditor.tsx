import React, {Component} from 'react';
import IEntity from "../../models/IEntity";
import IModel from "../../models/IModel";
import ShowIfTrue from "../common/ShowIfTrue";

interface IProps {
    entity: IEntity,
    model: IModel
}

interface IState {
    dataTypeSourceByAttributeId: { [key: string]: DataTypeSourceType }
}

const dataTypesById: { [key: string]: string } = {
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

enum DataTypeSourceType {
    DOMAIN,
    RAW_TYPE
}

const getLabelForDataType = (dataType: string): string => {
    return dataTypesById[dataType.replace(/[0-9]/g, '')]
};

class EntityEditor extends Component<IProps, IState> {
    state = {
        dataTypeSourceByAttributeId: {}
    };

    componentDidMount(): void {
        const {model} = this.props

        this.setState({
            dataTypeSourceByAttributeId: Object.keys(model.attributes).reduce((acc: { [key: string]: DataTypeSourceType }, attributeId: string) => {
                acc[attributeId] = model.attributes[attributeId].domainId === undefined ? DataTypeSourceType.RAW_TYPE : DataTypeSourceType.DOMAIN
                return acc;
            }, {})
        })
    }

    handleDataTypeSource = (attributeId: string, nextTypeSource: DataTypeSourceType) => {
        console.log(nextTypeSource)
        this.setState((prevState) => ({
            dataTypeSourceByAttributeId: {
                ...prevState.dataTypeSourceByAttributeId,
                ...{[attributeId]: nextTypeSource}
            }
        }))
    };

    render() {
        const {entity, model} = this.props;
        const dataTypeSourceByAttributeId: { [key: string]: DataTypeSourceType } = this.state.dataTypeSourceByAttributeId;

        const domainOptions = Object.values(model.domains).map(domain => ({
            id: domain.id,
            label: `${domain.name}(${getLabelForDataType(domain.dataType)})`
        }));

        return (
            <div>
                <table>
                    <tbody>
                    <tr>
                        <th>Name</th>
                        <th>Type source</th>
                        <th>Data type</th>
                        <th>Length</th>
                        <th>Identifier</th>
                    </tr>
                    {entity.attributeIds.map(attributeId => {
                        const isPrimaryIdentifier = model.attributes[attributeId].domainId !== undefined && model.domains[model.attributes[attributeId].domainId!].dataType === 'I';

                        return <tr key={attributeId}>
                            <td className='pr-2'>{model.attributes[attributeId].name}</td>
                            <td className='pr-2'>
                                <select
                                    value={dataTypeSourceByAttributeId[attributeId]}
                                    onChange={e => this.handleDataTypeSource(attributeId, e.target.value === DataTypeSourceType.DOMAIN.toString() ? DataTypeSourceType.DOMAIN : DataTypeSourceType.RAW_TYPE)}>
                                    <option value={DataTypeSourceType.DOMAIN}>Domain</option>
                                    <option value={DataTypeSourceType.RAW_TYPE}>Raw Type</option>
                                </select>
                            </td>
                            <ShowIfTrue
                                condition={dataTypeSourceByAttributeId[attributeId] === DataTypeSourceType.RAW_TYPE}>
                                <td className='pr-2'>
                                    <select>
                                        {Object.keys(dataTypesById).map((type: string) => <option
                                            selected={type === model.attributes[attributeId].dataType}>{getLabelForDataType(type)}</option>)}
                                    </select>
                                </td>
                                <td><input type='number' value={model.attributes[attributeId].length}/></td>
                            </ShowIfTrue>
                            <ShowIfTrue
                                condition={dataTypeSourceByAttributeId[attributeId] === DataTypeSourceType.DOMAIN}>
                                <td className='pl-2'>
                                    <select>
                                        <option selected={model.attributes[attributeId].domainId === undefined}>None
                                        </option>
                                        {domainOptions.map(domain => <option
                                            selected={domain.id === model.attributes[attributeId].domainId}>{domain.label}</option>)}
                                    </select>
                                </td>
                                <td>-</td>
                            </ShowIfTrue>

                            <td><input type='checkbox' checked={isPrimaryIdentifier}/></td>
                        </tr>
                    })}
                    </tbody>
                </table>
            </div>
        )
    };
}

export default EntityEditor;
