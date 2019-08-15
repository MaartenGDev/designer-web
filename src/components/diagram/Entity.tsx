import React from 'react';
import IModel from "../../models/IModel";
import IEntity from "../../models/IEntity";
import {SelectedDataType} from "../../models/SelectedDataType";
import IEntityIdentifier from "../../models/IEntityIdentifier";

interface IProps {
    model: IModel,
    entity: IEntity,
    position: {
        top: number,
        left: number
    },
    className?: string,
    onModelSelectionChange: (selectedDataType: SelectedDataType, selectedId: string | undefined) => void
}

const getLabelForIdentifier = (identifier: IEntityIdentifier | undefined) => {
    if (identifier === undefined) return '';
    if (identifier.isPrimary) return '<pi>';

    return '<ai>';
};

const Entity = ({className, entity, model, onModelSelectionChange, position}: IProps) => {
    return (
        <div key={entity.id} data-custom-id={entity.id}
             className={`entity absolute bg-white shadow ${className || ''} ${model.relations.find(x => x.from.ref === entity.id || x.to.ref === entity.id) === undefined ? '' : 'has-relations'} entity-${entity.id}`}
             style={{
                 top: position.top,
                 left: position.left,
             }} onClick={e => {

            e.stopPropagation();

            if ((e.currentTarget as Element).classList.contains('jtk-dragged')) {
                (e.currentTarget as Element).classList.remove('jtk-dragged')
            } else {
                onModelSelectionChange(SelectedDataType.ENTITY, entity.id)
            }
        }}>

            <div className='p-4 border-b border-grey-lighter relative font-bold text-grey-darker'>
                <span className='connect-point rounded-full w-6 h-6 bg-blue text-white p-2 inline-block absolute pin-r flex justify-center items-center' style={{marginTop: '-28px', marginRight: '-12px'}}>+</span>
                <p>{entity.name}</p>
            </div>
            <div className='p-4'>
                <table className='text-sm'>
                    <tbody>
                    {entity.attributes.map(attribute => {
                        const identifier = entity.identifiers.find(identifier => identifier.attributeId === attribute.id);

                        return <tr key={attribute.id}
                                   className={identifier === undefined ? '' : (identifier.isPrimary ? 'primary-identifier-row' : 'identifier-row')}>
                            <td className='pr-2'>{attribute.name}</td>
                            <td>{getLabelForIdentifier(identifier)}</td>
                            <td className='pl-2'>{attribute.domainId === undefined ? attribute.name : model.domains[attribute.domainId!].name}</td>
                        </tr>
                    })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
export default Entity;
