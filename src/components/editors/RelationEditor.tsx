import React, {Component} from 'react';
import IModel from "../../models/IModel";
import IRelation from "../../models/IRelation";

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
                    <h1>Edit relation</h1>
                </div>
            </div>
        )
    };
}
