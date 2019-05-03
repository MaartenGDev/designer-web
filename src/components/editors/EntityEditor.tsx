import React, {Component} from 'react';
import IEntity from "../../models/IEntity";
import IModel from "../../models/IModel";
import ShowIfTrue from "../common/ShowIfTrue";
import IEntityAttribute from "../../models/IEntityAttribute";
import {EntityIdentifierChangeAction} from "../../models/EntityIdentifierChangeAction";
import IEntityIdentifier from "../../models/IEntityIdentifier";

interface IProps {
    entity: IEntity,
    model: IModel,
    onEntityChange: (entityId: string, attributeName: string, value: any) => void
    onEntityAttributeDomainChange: (entityId: string, attributeId: string, dataItemId: string, nextDomainId: string) => void
    onEntityAttributeChange: (entityId: string, attributeId: string, dataItemId: string, nextDataType: string, nextDataTypeLength: number) => void
    onEntityIdentifierChange: (entityId: string, changAction: EntityIdentifierChangeAction, identifier: IEntityIdentifier | undefined) => void
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
        const {entity, model} = this.props;
        this.setDefaultAttributeSourceTypesForEntity(entity, model)
    }

    componentWillReceiveProps(nextProps: IProps): void {
        const {entity, model} = nextProps;
        this.setDefaultAttributeSourceTypesForEntity(entity, model)
    }

    setDefaultAttributeSourceTypesForEntity = (entity: IEntity, model: IModel) => {
        this.setState({
            dataTypeSourceByAttributeId: entity.attributes.reduce((acc: { [key: string]: DataTypeSourceType }, attribute: IEntityAttribute) => {
                acc[attribute.id] = model.dataItems[attribute.dataItemId].domainId === undefined ? DataTypeSourceType.RAW_TYPE : DataTypeSourceType.DOMAIN;
                return acc;
            }, {})
        })
    };

    handleDataTypeSourceChange = (attributeId: string, nextTypeSource: DataTypeSourceType) => {
        this.setState((prevState) => ({
            dataTypeSourceByAttributeId: {
                ...prevState.dataTypeSourceByAttributeId,
                ...{[attributeId]: nextTypeSource}
            }
        }))
    };

    getTypeIdentifierForDataType(dataTypeName: string){
        for(const typeIdentifier of Object.keys(dataTypesById)){
            if(dataTypesById[typeIdentifier] === dataTypeName){
                return typeIdentifier;
            }
        }

        return null;
    }

    render() {
        const {entity, model, onEntityChange, onEntityAttributeDomainChange, onEntityIdentifierChange, onEntityAttributeChange} = this.props;
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
                        id="form-input-name" type="text" placeholder="" value={entity.name}
                        onChange={e => onEntityChange(entity.id, 'a:Name', e.target.value)}/>
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
                        {entity.attributes.map(attribute => {
                            const identifier = entity.identifiers.find(identifier => identifier.attributeId === attribute.id);

                            return <tr key={attribute.id}>
                                <td className='table__cell'>{model.dataItems[attribute.dataItemId].name}</td>
                                <td className='table__cell'>
                                    <select className='form__input form__input--select'
                                            value={dataTypeSourceByAttributeId[attribute.id]}
                                            onChange={e => this.handleDataTypeSourceChange(attribute.id, e.target.value === DataTypeSourceType.DOMAIN.toString() ? DataTypeSourceType.DOMAIN : DataTypeSourceType.RAW_TYPE)}>
                                        <option value={DataTypeSourceType.DOMAIN}>Domain</option>
                                        <option value={DataTypeSourceType.RAW_TYPE}>Raw Type</option>
                                    </select>
                                </td>
                                <ShowIfTrue
                                    condition={dataTypeSourceByAttributeId[attribute.id] === DataTypeSourceType.RAW_TYPE}>
                                    <td className='table__cell'>
                                        <select className='form__input form__input--select'
                                                value={model.dataItems[attribute.dataItemId].dataType}
                                                onChange={e => onEntityAttributeChange(entity.id, attribute.id, attribute.dataItemId, e.target.value, model.dataItems[attribute.dataItemId].length)}>
                                            {Object.keys(dataTypesById).map((type: string) => <option key={type} value={type}>{getLabelForDataType(type)}</option>)}
                                        </select>
                                    </td>
                                    <td className='p-2 border-t border-grey-light  text-xs'>
                                        <input type='number'
                                               className='form__input'
                                               onChange={e => onEntityAttributeChange(entity.id, attribute.id, attribute.dataItemId, model.dataItems[attribute.dataItemId].dataType, parseInt(e.target.value, 10))}
                                               value={model.dataItems[attribute.dataItemId].length}/>
                                    </td>
                                </ShowIfTrue>
                                <ShowIfTrue
                                    condition={dataTypeSourceByAttributeId[attribute.id] === DataTypeSourceType.DOMAIN}>
                                    <td className='table__cell'>
                                        <select className='form__input form__input--select'
                                                value={model.dataItems[attribute.dataItemId].domainId}
                                                onChange={e => onEntityAttributeDomainChange(entity.id, attribute.id, attribute.dataItemId, e.target.value)}>
                                            {domainOptions.map(domain => {
                                                return <option key={domain.id} value={domain.id}>{domain.label}</option>
                                            })}
                                        </select>
                                    </td>
                                    <td className='table__cell'>
                                        <input type='number'
                                               className='form__input'
                                               value={model.domains[model.dataItems[attribute.dataItemId].domainId!].length}
                                               disabled={true}/>
                                    </td>
                                </ShowIfTrue>

                                <td className='p-2 border-t border-grey-light text-xs'>
                                    <input type='checkbox' checked={identifier !== undefined} onChange={e => onEntityIdentifierChange(entity.id, identifier=== undefined ? EntityIdentifierChangeAction.ATTACH : EntityIdentifierChangeAction.DETACH, identifier)}/>
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
