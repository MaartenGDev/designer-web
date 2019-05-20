import React, {Component} from 'react';
import IModel from "../../models/IModel";
import Entity from "./Entity";
import {DistanceHelper} from "../../helpers/DistanceHelper";

interface IProps {
    model: IModel,
    onDeterminedScale: (scale: number) => void
}

interface IState {
}

class SizingRenderer extends Component<IProps, IState> {
    componentDidMount(): void {
        const node = document.querySelector('.render-node')!;
        const localLength = node.clientWidth;

        const entity = this.props.model.entities[0];
        const realLength = DistanceHelper.calculateLengthBetweenXCoordinates(entity.location.bottomRight.x, entity.location.topLeft.x);

        this.props.onDeterminedScale(localLength / realLength);
    }

    render() {
        const {model} = this.props;
        const entity = model.entities[0];


        return <div>
            <Entity
                className='render-node'
                model={model}
                entity={entity}
                onModelSelectionChange={() => {
                }}
                position={{top: 1, left: 1}}
            />
        </div>
    }
}

export default SizingRenderer;
