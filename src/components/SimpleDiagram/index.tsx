import debounce from 'lodash/debounce';
import React, {
    CSSProperties,
    PureComponent
} from 'react';
import {AutoSizer} from 'react-virtualized';
import {
    Connections,
    Graph,
    Node,
    NodeContent
} from 'jsplumb-react';
import './Diagram.css';

const style: CSSProperties = {
    height: 50
};

const nodes: {
    [key: string]: {
        label: string,
        style: CSSProperties
    }
} = {
    node1: {
        label: 'node 1',
        style: {
            left: 272.5,
            top: 233
        }
    },
    node2: {
        label: 'node 2',
        style: {
            left: 672.5,
            top: 233
        }
    }
};

const connections: Connections = [
    {
        id: 'connection1',
        source: 'node1',
        target: 'node2'
    },
];

export interface IDiagramState {
    connections: Connections;
    height: number;
    maxScale?: number;
    minScale?: number;
    nodes: any;
    scale: number;
    width: number;
    xOffset: number;
    yOffset: number;
}

export default class Diagram extends PureComponent<{}, IDiagramState> {
    public state = {
        connections,
        height: 500,
        maxScale: 2,
        minScale: 0.25,
        nodes: nodes as any,
        scale: 1,
        width: 500,
        xOffset: 0.0,
        yOffset: 0.0
    };

    private handleResize = debounce(
        ({height, width}: { height: number, width: number }) => {
            this.setState({height, width});
        },
        400,
        {trailing: true}
    );

    public render() {
        const children = Object.keys(this.state.nodes).map((id) => {
            return (
                <Node
                    id={id}
                    key={id}
                    onDrop={this.handleDrop}
                    style={this.state.nodes[id].style}
                    styleName='node'
                >
                    {this.children}
                </Node>
            );
        });

        return (
            <div styleName='canvas'>
                <AutoSizer onResize={this.handleResize}>
                    {this.autoSizer}
                </AutoSizer>
                <Graph
                    connections={this.state.connections}
                    height={this.state.height}
                    id={'simpleDiagram'}
                    maxScale={this.state.maxScale}
                    minScale={this.state.minScale}
                    onAddConnection={this.handleAddConnection}
                    onRemoveConnection={this.handleRemoveConnection}
                    onPanEnd={this.handlePanEnd}
                    onZoom={this.handleZoom}
                    scale={this.state.scale}
                    width={this.state.width}
                    xOffset={this.state.xOffset}
                    yOffset={this.state.yOffset}
                >
                    {children}
                </Graph>
            </div>
        );
    }

    private autoSizer = () => null as any;

    private children = (id: string) => (
        <NodeContent
            id={id}
            label={this.state.nodes[id].label}
            onRemoveNode={this.handleClose}
            style={style}
        >
            {this.state.nodes[id].label || id}
        </NodeContent>
    )

    private handleClose = (nodeId: string) => {
        if (confirm(`Remove node '${nodeId}'?`)) {
            const {[nodeId]: omit, ...remaining} = this.state.nodes;
            this.setState({
                connections: this.state.connections.filter(connection => (
                    connection.source !== nodeId && connection.target !== nodeId
                )),
                nodes: remaining
            });
        }
    }

    private handlePanEnd = (
        xOffset: number,
        yOffset: number
    ) => {
        this.setState({xOffset, yOffset});
    }

    private handleZoom = (
        scale: number
    ) => {
        this.setState({scale});
    }

    private handleDrop = (
        id: string,
        x: number,
        y: number
    ) => {
        this.setState({
            nodes: {
                ...this.state.nodes,
                [id]: {...this.state.nodes[id], x, y}
            }
        });
    }

    private handleAddConnection = (
        source: string,
        id: string,
        target: string
    ) => {
        this.setState({
            connections: [
                ...this.state.connections,
                {id, source, target}
            ]
        });
    }

    private handleRemoveConnection = (
        id: string
    ) => {
        if (confirm(`Remove connection '${id}'?`)) {
            this.setState({
                connections: this.state.connections.filter(connection => (
                    connection.id !== id
                ))
            });
        }
    }
}
