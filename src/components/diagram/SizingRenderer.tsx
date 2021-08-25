import React, {Component} from 'react';
import IModel from "../../models/IModel";
import Entity from "./Entity";
import {DistanceHelper} from "../../helpers/DistanceHelper";
import {Scaling} from "../../models/Scaling";

interface IProps {
    model: IModel,
    onDeterminedScale: (scaling: Scaling) => void
}

interface IState {
}

class SizingRenderer extends Component<IProps, IState> {
    componentDidMount(): void {
        const node = document.querySelector('.render-node')!,
            localLength = node.clientWidth,
            entity = this.props.model.entities[0],
            realLength = DistanceHelper.calculateLengthBetweenXCoordinates(entity.location.bottomRight.x, entity.location.topLeft.x);

        this.props.onDeterminedScale({downScalingFactor: localLength / realLength, upScalingFactor: realLength / localLength});
    }

    render() {
        const {model} = this.props,
            entity = model.entities[0];

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
