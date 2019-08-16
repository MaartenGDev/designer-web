import React, {Component} from 'react';
import IModel from "../../models/IModel";
import IRelation from "../../models/IRelation";

interface IProps {
    relation: IRelation,
    model: IModel,
    onDismiss: () => void
    onRelationDelete: (relationId: string) => void
    onRelationChange: (relationId: string, attributeName: string, value: any) => void
    onRelationFromRefChange: (relationId: string, targetEntityId: string) => void
    onRelationFromCardinalityChange: (relationId: string, nextCardinality: string) => void
    onRelationToRefChange: (relationId: string, targetEntityId: string) => void
    onRelationToCardinalityChange: (relationId: string, nextCardinality: string) => void
}

interface IState {

}


export default class RelationEditor extends Component<IProps, IState> {
    state = {};

    cardinalityOptions = ['0,1', '0,n', '1,1', '1,n'];

    render() {
        const {relation, model, onRelationChange, onRelationFromRefChange, onRelationToRefChange, onRelationFromCardinalityChange, onRelationToCardinalityChange, onRelationDelete, onDismiss} = this.props;

        return (
            <div>
                <div>
                    <div className='flex justify-between'>

                        <label className="form__label" htmlFor="form-input-name">
                            Name
                        </label>
                    </div>
                    <input
                        className="form__input focus:outline-none focus:bg-white focus:border-grey text-sm"
                        id="form-input-name" type="text" placeholder="" value={relation.name}
                        onChange={e => onRelationChange(relation.id, 'a:Name', e.target.value)}/>
                </div>
                <div className="w-full mt-6">
                    <table className='w-full text-left table-collapse'>
                        <tbody className='align-baseline'>
                        <tr>
                            <th className='table__header'>From</th>
                            <th className='table__header'>Cardinality</th>
                            <th className='table__header'>To</th>
                            <th className='table__header'>Cardinality</th>
                        </tr>
                        <tr>
                            <td className='table__cell'>
                                <select className='form__input form__input--select'
                                        value={relation.from.ref}
                                        onChange={e => onRelationFromRefChange(relation.id, e.target.value)}>
                                    {model.entities.map(entity => <option key={entity.id}
                                                                          value={entity.id}>{entity.name}</option>)}
                                </select>
                            </td>

                            <td className='table__cell'>
                                <select className='form__input form__input--select'
                                        value={relation.from.cardinality}
                                        onChange={e => onRelationFromCardinalityChange(relation.id, e.target.value)}>
                                    {this.cardinalityOptions.map(cardinality => <option key={cardinality}
                                                                                        value={cardinality}>{cardinality}</option>)}
                                </select>
                            </td>
                            <td className='table__cell'>
                                <select className='form__input form__input--select'
                                        value={relation.to.ref}
                                        onChange={e => onRelationToRefChange(relation.id, e.target.value)}>
                                    {model.entities.map(entity => <option key={entity.id}
                                                                          value={entity.id}>{entity.name}</option>)}
                                </select>
                            </td>
                            <td className='table__cell'>
                                <select className='form__input form__input--select'
                                        value={relation.to.cardinality}
                                        onChange={e => onRelationToCardinalityChange(relation.id, e.target.value)}>
                                    {this.cardinalityOptions.map(cardinality => <option key={cardinality}
                                                                                        value={cardinality}>{cardinality}</option>)}
                                </select>
                            </td>
                        </tr>
                        </tbody>
                    </table>

                    <div className='flex mt-4'>
                        <span
                            className="form__label form__label--danger form__label--inline px-4 py-3 cursor-pointer rounded-sm"
                            onClick={e => onRelationDelete(relation.id)}>
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
