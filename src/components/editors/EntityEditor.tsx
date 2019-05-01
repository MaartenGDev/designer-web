import React, {Component} from 'react';
import IEntity from "../../models/IEntity";
import IModel from "../../models/IModel";
import ShowIfTrue from "../common/ShowIfTrue";

interface IProps {
    entity: IEntity,
    model: IModel,
    onEntityChange: (entityId: string, attributeName: string, value: any) => void
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
        const {entity, model, onEntityChange} = this.props;
        const dataTypeSourceByAttributeId: { [key: string]: DataTypeSourceType } = this.state.dataTypeSourceByAttributeId;

        const domainOptions = Object.values(model.domains).map(domain => ({
            id: domain.id,
            label: `${domain.name}(${getLabelForDataType(domain.dataType)})`
        }));

        return (
            <div>
                <div>
                    <label className="form__label" htmlFor="form-input-name">
                        Name
                    </label>
                    <input
                        className="form__input focus:outline-none focus:bg-white focus:border-grey text-sm"
                        id="form-input-name" type="text" placeholder="" value={entity.name} onChange={e => onEntityChange(entity.id, 'a:Name', e.target.value)} />
                </div>
                <div className="w-full mt-6">
                    <label className="form__label" htmlFor="form-input-name">
                        Attributes
                    </label>

                    <table className='w-full text-left table-collapse'>
                        <tbody className='align-baseline'>
                        <tr>
                            <th className='table__header'>Name</th>
                            <th className='table__header'>Type source</th>
                            <th className='table__header'>Data type</th>
                            <th className='table__header'>Length</th>
                            <th className='table__header'>Identifier</th>
                        </tr>
                        {entity.attributeIds.map(attributeId => {
                            const isPrimaryIdentifier = model.attributes[attributeId].domainId !== undefined && model.domains[model.attributes[attributeId].domainId!].dataType === 'I';

                            return <tr key={attributeId}>
                                <td className='table__cell'>{model.attributes[attributeId].name}</td>
                                <td className='table__cell'>
                                    <select className='form__input form__input--select'
                                            value={dataTypeSourceByAttributeId[attributeId]}
                                            onChange={e => this.handleDataTypeSource(attributeId, e.target.value === DataTypeSourceType.DOMAIN.toString() ? DataTypeSourceType.DOMAIN : DataTypeSourceType.RAW_TYPE)}>
                                        <option value={DataTypeSourceType.DOMAIN}>Domain</option>
                                        <option value={DataTypeSourceType.RAW_TYPE}>Raw Type</option>
                                    </select>
                                </td>
                                <ShowIfTrue
                                    condition={dataTypeSourceByAttributeId[attributeId] === DataTypeSourceType.RAW_TYPE}>
                                    <td className='table__cell'>
                                        <select className='form__input form__input--select'>
                                            {Object.keys(dataTypesById).map((type: string) => <option
                                                selected={type === model.attributes[attributeId].dataType}>{getLabelForDataType(type)}</option>)}
                                        </select>
                                    </td>
                                    <td className='p-2 border-t border-grey-light  text-xs'><input type='number'
                                                                                                   className='form__input'
                                                                                                   value={model.attributes[attributeId].length}/>
                                    </td>
                                </ShowIfTrue>
                                <ShowIfTrue
                                    condition={dataTypeSourceByAttributeId[attributeId] === DataTypeSourceType.DOMAIN}>
                                    <td className='table__cell'>
                                        <select className='form__input form__input--select'>
                                            <option selected={model.attributes[attributeId].domainId === undefined}>None
                                            </option>
                                            {domainOptions.map(domain => <option
                                                selected={domain.id === model.attributes[attributeId].domainId}>{domain.label}</option>)}
                                        </select>
                                    </td>
                                    <td className='table__cell'>
                                        <input type='number'
                                               className='form__input'
                                               value={model.domains[model.attributes[attributeId].domainId!].length}
                                               disabled={true}/>
                                    </td>
                                </ShowIfTrue>

                                <td className='p-2 border-t border-grey-light text-xs'>
                                    <input type='checkbox' checked={isPrimaryIdentifier}/>
                                </td>
                            </tr>
                        })}
                        </tbody>
                    </table>
                </div>
            </div>
        )
    };
}

export default EntityEditor;
