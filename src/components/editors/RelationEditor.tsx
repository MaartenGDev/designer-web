import React, {Component} from 'react';
import IModel from "../../models/IModel";
import IRelation from "../../models/IRelation";
import {DataTypeHelper} from "../../helpers/DataTypeHelper";

interface IProps {
    relation: IRelation,
    model: IModel,
    onRelationChange: (relationId: string, attributeName: string, value: any) => void
}

interface IState {

}


export default class RelationEditor extends Component<IProps, IState> {
    state = {
    };

    cardinalityOptions = ['0,1', '0,n', '1,1', '1,n'];

    render() {
        const {relation, model, onRelationChange} = this.props;

        return (
            <div>
                <div>
                    <label className="form__label" htmlFor="form-input-name">
                        Name
                    </label>
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
                                        onChange={e => {}}>
                                    {model.entities.map(entity => <option key={entity.id} value={entity.id}>{entity.name}</option>)}
                                </select>
                            </td>

                            <td className='table__cell'>
                                <select className='form__input form__input--select'
                                        value={relation.from.cardinality}
                                        onChange={e => {}}>
                                    {this.cardinalityOptions.map(cardinality => <option key={cardinality} value={cardinality}>{cardinality}</option>)}
                                </select>
                            </td>
                            <td className='table__cell'>
                                <select className='form__input form__input--select'
                                        value={relation.to.ref}
                                        onChange={e => {}}>
                                    {model.entities.map(entity => <option key={entity.id} value={entity.id}>{entity.name}</option>)}
                                </select>
                            </td>
                            <td className='table__cell'>
                                <select className='form__input form__input--select'
                                        value={relation.to.cardinality}
                                        onChange={e => {}}>
                                    {this.cardinalityOptions.map(cardinality => <option key={cardinality} value={cardinality}>{cardinality}</option>)}
                                </select>
                            </td>
                        </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        )
    };
}
