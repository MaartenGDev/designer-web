import React, {Component} from 'react';
import IEntity from "../../models/IEntity";
import IModel from "../../models/IModel";
import {EntityIdentifierChangeAction} from "../../models/EntityIdentifierChangeAction";
import IEntityIdentifier from "../../models/IEntityIdentifier";
import {DataTypeHelper} from "../../helpers/DataTypeHelper";
import IAttribute from "../../models/IAttribute";

interface IProps {
    entity: IEntity,
    model: IModel,
    onDismiss: () => void
    onEntityDelete: (entityId: string) => void
    onEntityChange: (entityId: string, attributeName: string, value: any) => void
    onEntityAttributeDomainChange: (entityId: string, attributeId: string, dataItemId: string, nextDomainId: string) => void
    onEntityAttributeChange: (entityId: string, attributeId: string, dataItemId: string, nextDataType: string, nextDataTypeLength: number) => void
    onEntityIdentifierChange: (entityId: string, changeAction: EntityIdentifierChangeAction, attributeId: string) => void,
    onEntityAttributeCreation: (entityId: string, name: string, dataType: string, length: number) => void,
    onEntityAttributeRemoval: (entityId: string, attributeId: string) => void,
}

interface IState {
    dataTypeSourceByAttributeId: { [key: string]: DataTypeSourceType }
}
enum DataTypeSourceType {
    DOMAIN,
    RAW_TYPE
}

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
            dataTypeSourceByAttributeId: entity.attributes.reduce((acc: { [key: string]: DataTypeSourceType }, attribute: IAttribute) => {
                acc[attribute.id] = attribute.domainId === undefined ? DataTypeSourceType.RAW_TYPE : DataTypeSourceType.DOMAIN;
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

    private getEntityIdentifierChangeAction(identifier: IEntityIdentifier | undefined) {
        if (identifier === undefined) return EntityIdentifierChangeAction.NONE;
        if (identifier.isPrimary) return EntityIdentifierChangeAction.PRIMARY;

        return EntityIdentifierChangeAction.REGULAR;
    }

    private getAsEntityIdentifierChangeAction(rawValue: string) {
        if (rawValue === EntityIdentifierChangeAction.NONE.toString()) return EntityIdentifierChangeAction.NONE;
        if (rawValue === EntityIdentifierChangeAction.PRIMARY.toString()) return EntityIdentifierChangeAction.PRIMARY;

        return EntityIdentifierChangeAction.REGULAR;
    }

    render() {
        const {entity, model, onEntityChange, onEntityAttributeDomainChange, onEntityIdentifierChange, onEntityAttributeChange, onEntityAttributeCreation, onEntityAttributeRemoval, onEntityDelete, onDismiss} = this.props;
        const dataTypeSourceByAttributeId: { [key: string]: DataTypeSourceType } = this.state.dataTypeSourceByAttributeId;

        const domainOptions = Object.values(model.domains).map(domain => ({
            id: domain.id,
            label: `${domain.name}(${DataTypeHelper.getLabelForDataType(domain.dataType)})`
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
                    <div className='flex'>
                        <span className="form__label">
                            Attributes
                        </span>
                        <span className="form__label form__label--green ml-2"
                              onClick={e => onEntityAttributeCreation(entity.id, 'attribute1', 'VA', 50)}>
                            Add
                        </span>
                    </div>
                    <table className='w-full text-left table-collapse'>
                        <tbody className='align-baseline'>
                        <tr>
                            <th className='table__header'>Name</th>
                            <th className='table__header'>Type source</th>
                            <th className='table__header'>Data type</th>
                            <th className='table__header'>Length</th>
                            <th className='table__header'>Identifier</th>
                            <th className='table__header'>Remove</th>
                        </tr>
                        {entity.attributes.map(attribute => {
                            const identifier = entity.identifiers.find(identifier => identifier.attributeId === attribute.id);

                            return <tr key={attribute.id}>
                                <td className='table__cell'>{attribute.name}</td>
                                <td className='table__cell'>
                                    <select className='form__input form__input--select'
                                            value={dataTypeSourceByAttributeId[attribute.id]}
                                            onChange={e => this.handleDataTypeSourceChange(attribute.id, e.target.value === DataTypeSourceType.DOMAIN.toString() ? DataTypeSourceType.DOMAIN : DataTypeSourceType.RAW_TYPE)}>
                                        <option value={DataTypeSourceType.DOMAIN}>Domain</option>
                                        <option value={DataTypeSourceType.RAW_TYPE}>Raw Type</option>
                                    </select>
                                </td>
                                {dataTypeSourceByAttributeId[attribute.id] === DataTypeSourceType.RAW_TYPE && <>
                                  <td className='table__cell'>
                                    <select className='form__input form__input--select'
                                            value={DataTypeHelper.getDataTypeWithoutLength(attribute.dataType)}
                                            onChange={e => onEntityAttributeChange(entity.id, attribute.id, attribute.dataItemId!, e.target.value, attribute.length)}>
                                        {Object.keys(DataTypeHelper.allTypes()).map((type: string) => <option key={type}
                                                                                                              value={type}>{DataTypeHelper.getLabelForDataType(type)}</option>)}
                                    </select>
                                  </td>
                                  <td className='p-2 border-t border-grey-light  text-xs'>
                                    <input type='number'
                                           className='form__input'
                                           onChange={e => onEntityAttributeChange(entity.id, attribute.id, attribute.dataItemId!, attribute.dataType, parseInt(e.target.value, 10))}
                                           value={attribute.length}/>
                                  </td>
                                </>}
                                {dataTypeSourceByAttributeId[attribute.id] === DataTypeSourceType.DOMAIN && <>
                                  <td className='table__cell'>
                                    <select className='form__input form__input--select'
                                            value={attribute.domainId}
                                            onChange={e => onEntityAttributeDomainChange(entity.id, attribute.id, attribute.dataItemId!, e.target.value)}>
                                        {domainOptions.map(domain => {
                                            return <option key={domain.id} value={domain.id}>{domain.label}</option>
                                        })}
                                    </select>
                                  </td>
                                  <td className='table__cell'>
                                    <input type='number'
                                           className='form__input'
                                           value={model.domains[attribute.domainId!] ? model.domains[attribute.domainId!].length : 0}
                                           disabled={true}/>
                                  </td>
                                </>}

                                <td className='table__cell'>
                                    <select value={this.getEntityIdentifierChangeAction(identifier)}
                                            className='form__input form__input--select'
                                            onChange={e => onEntityIdentifierChange(entity.id, this.getAsEntityIdentifierChangeAction(e.target.value), attribute.id)}>
                                        <option value={EntityIdentifierChangeAction.NONE}>None</option>
                                        <option value={EntityIdentifierChangeAction.REGULAR}>Regular</option>
                                        <option value={EntityIdentifierChangeAction.PRIMARY}>Primary</option>
                                    </select>
                                </td>
                                <td className="table__cell">
                                        <span className="form__label form__label--red ml-2"
                                              onClick={e => onEntityAttributeRemoval(entity.id, attribute.id)}>Remove</span>
                                </td>
                            </tr>
                        })}
                        </tbody>
                    </table>
                    <div className='flex mt-4'>
                        <span
                            className="form__label form__label--danger form__label--inline px-4 py-3 cursor-pointer rounded-sm"
                            onClick={e => onEntityDelete(entity.id)}>
                            REMOVE
                        </span>

                        <span
                            className="form__label form__label--gray ml-2 flex-1 form__label--inline px-4 py-3 cursor-pointer rounded-sm"
                            onClick={e => onDismiss()}>
                            DISMISS
                        </span>
                    </div>
                </div>
            </div>
        )
    };
}

export default EntityEditor;
