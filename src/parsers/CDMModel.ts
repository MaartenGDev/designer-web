import {DOMParser, XMLSerializer} from 'xmldom'
import uid from 'uuid/v4';
import {DataTypeHelper} from "../helpers/DataTypeHelper";
import IRectangleCoordinates from "../models/IRectangleCoordinates";

class CDMModel {
    private document: Document = new Document();

    public loadFromXml(xml: string) {
        this.document = new DOMParser().parseFromString(xml);
    }
    getModelNode(){
        return this.findNodeByPath(this.document, 'o:RootObject.c:Children.o:Model');
    }

    public findNode(pathRelativeFromModel: string) {
        return this.findNodeByPath(this.document, 'o:RootObject.c:Children.o:Model.' + pathRelativeFromModel);
    }

    private findNodeByPath(document: Document, path: string): Element {
        let lastNode: Element = document.documentElement;

        path.split('.').forEach(nodeName => {
            lastNode = this.getChildNodeForName(lastNode.childNodes, nodeName);
        });

        return lastNode;
    }

    private getChildNodeForName(nodes: NodeListOf<ChildNode>, nodeName: string): Element {
        return Array.from(nodes).find(node => node.nodeName === nodeName) as Element;
    }

    private findChildNode(node: Node, predicate: (childNode: Node) => boolean): Element {
        return Array.from(node.childNodes).find(predicate) as Element;
    }

    private findEntity(entityId: string): Element {
        return this.findChildNode(this.findNode('c:Entities'), (node: Node) => {
            return node.nodeName === 'o:Entity' && (node as Element).getAttribute('Id') === entityId
        })
    }

    setAttributeForEntity(entityId: string, attributeName: string, value: string) {
        const entity = this.findEntity(entityId);
        const valueNode = this.findChildNode(entity, (node: Node) => node.nodeName === attributeName).firstChild as Text;

        valueNode.data = value;
        return entity;
    }

    setDataItemRefForEntity(entityId: string, attributeId: string, dataItemId: string) {
        const entity = this.findEntity(entityId);
        const attribute = this.findChildNode(this.findChildNode(this.findChildNode(this.findChildNode(entity,
            (entityProperty) => entityProperty.nodeName === 'c:Attributes'), (node) => {
                return node.nodeName === 'o:EntityAttribute' && (node as Element).getAttribute('Id') === attributeId
            }), (entityAttribute) => entityAttribute.nodeName === 'c:DataItem'),
            (node: Node) => {
                return node.nodeName === 'o:DataItem';
            });

        attribute.setAttribute('Ref', dataItemId);

        return entity;
    }

    moveEntity(entityId: string, nextCoordinates: IRectangleCoordinates) {
        const symbols = this.findNode('c:ConceptualDiagrams.o:ConceptualDiagram.c:Symbols');

        const symbolNode = this.findChildNode(symbols, (node) => {
            return node.nodeName === 'o:EntitySymbol' && this.findChildNode(node, (childNode) => {
                return childNode.nodeName === 'c:Object' &&
                    this.findChildNode(childNode, (objectNode) => objectNode.nodeName === 'o:Entity' && (objectNode as Element).getAttribute('Ref') === entityId) !== undefined
            }) !== undefined
        });

        this.setAttributesOnNode(symbolNode, {
            'a:Rect': `((${nextCoordinates.topLeft.x},${nextCoordinates.bottomRight.y}), (${nextCoordinates.bottomRight.x},${nextCoordinates.topLeft.y}))`
        })
    }

    createEntity(name: string) {
        const entities = this.findNode('c:Entities');
        const symbols = this.findNode('c:ConceptualDiagrams.o:ConceptualDiagram.c:Symbols');

        const entityId = this.getNextUniqueId();
        const entityNode = this.buildBasicNode('o:Entity', name, {identifierId: entityId});

        const entitySymbolNode = this.document.createElement('o:EntitySymbol');
        entitySymbolNode.setAttribute('Id', this.getNextUniqueId());

        this.setAttributesOnNode(entitySymbolNode, {
            'a:CreationDate': '1556106851',
            'a:ModificationDate': '1556106851',
            'a:IconMode': '-1',
            'a:Rect': '((34395,-5606), (53577,3759))',
            'a:LineColor': '11184640',
            'a:FillColor': '11184640',
            'a:ShadowColor': '11184640',
            'a:FontList': `STRN 0 Arial,8,N
                                    DISPNAME 0 Arial,8,N
                                    Attributes 0 Arial,8,N
                                    EntityPrimaryAttribute 0 Arial,8,U
                                    Identifiers 0 Arial,8,N
                                    LABL 0 Arial,8,N`,
            'a:BrushStyle': '6',
            'a:GradientFillMode': '65',
            'a:GradientEndColor': '16777215'
        });

        const symbolObject = this.document.createElement('c:Object');
        const entityRefNode = this.document.createElement('o:Entity');
        entityRefNode.setAttribute('Ref', entityId);

        symbolObject.appendChild(entityRefNode);
        entitySymbolNode.appendChild(symbolObject);

        symbols.appendChild(entitySymbolNode);

        entities.appendChild(entityNode)
    }

    private findDataItem(dataItemId: string) {
        return this.findChildNode(this.findNode('c:DataItems'), (node) => {
            return node.nodeName === 'o:DataItem' && (node as Element).getAttribute('Id') === dataItemId
        });
    }

    setDomainForDataItem(dataItemId: string, nextDomainId: string): Element {
        const dataItem = this.findDataItem(dataItemId);

        const domainForDataItem = this.findChildNode(this.findChildNode(dataItem, (node) => {
            return node.nodeName === 'c:Domain'
        }), (node) => {
            return node.nodeName === 'o:Domain'
        });

        domainForDataItem.setAttribute("Ref", nextDomainId);

        return dataItem;
    }

    setDataTypeAndLengthForDataItem(dataItemId: string, nextDataType: string, nextDataTypeLength: number): Element {
        const dataItem = this.findDataItem(dataItemId);

        const domain = this.findChildNode(dataItem, (node) => node.nodeName === 'c:Domain');

        if (domain !== undefined) {
            dataItem.removeChild(domain)
        }

        const dataTypeNode = this.findChildNode(dataItem, (node) => {
            return node.nodeName === 'a:DataType';
        }).firstChild as Text;

        dataTypeNode.data = nextDataType;

        let dataTypeLengthNode = this.findChildNode(dataItem, (node) => {
            return node.nodeName === 'a:Length';
        });

        if (dataTypeLengthNode === undefined) {
            const lengthNode = this.document.createElement('a:Length');
            lengthNode.appendChild(this.document.createTextNode(nextDataTypeLength.toString()));

            dataItem.appendChild(lengthNode);
            dataTypeLengthNode = lengthNode;
        }

        (dataTypeLengthNode.firstChild as Text).data = nextDataTypeLength.toString();

        return dataItem;
    }

    createAttributeForEntity(entityId: string, name: string, dataType: string, length: number): Element {
        const entity = this.findEntity(entityId);
        let attributesNode = this.findChildNode(entity, node => node.nodeName === 'c:Attributes');

        if (attributesNode === undefined) {
            attributesNode = this.document.createElement('c:Attributes');
            entity.appendChild(attributesNode);
        }

        const attributeNode = this.buildBasicNode('o:EntityAttribute', name);
        attributesNode.appendChild(attributeNode);

        let dataItemsNode = this.findNode('c:DataItems');

        if(dataItemsNode === undefined){
            dataItemsNode = this.document.createElement('c:DataItems');
            this.getModelNode().appendChild(dataItemsNode);
        }

        const dataItem = this.buildBasicNode('o:DataItem', name);

        this.setAttributesOnNode(dataItem, {
            'a:DataType': DataTypeHelper.buildTypeIdentifier(dataType, length),
            'a:Length': length.toString()
        });

        dataItemsNode.appendChild(dataItem);

        const entityAttributeDataItemNode = this.document.createElement('c:DataItem');
        const entityAttributeDataItemRef = this.document.createElement('o:DataItem');

        entityAttributeDataItemRef.setAttribute("Ref", dataItem.getAttribute('Id')!);
        entityAttributeDataItemNode.appendChild(entityAttributeDataItemRef);
        attributeNode.appendChild(entityAttributeDataItemNode);

        return entity;
    }

    removeAttributeForEntity(entityId: string, attributeId: string) {
        const entity = this.findEntity(entityId);
        const attributesNode = this.findChildNode(entity, node => node.nodeName === 'c:Attributes');

        const attributeNode = this.findChildNode(attributesNode, node => node.nodeName === 'o:EntityAttribute' && (node as Element).getAttribute('Id') === attributeId)
        attributesNode.removeChild(attributeNode);

        // Try to find a leftover attribute
        const leftOverAttributeNode = this.findChildNode(attributesNode, (node) => node.nodeName === 'o:EntityAttribute');

        // Remove attributes element if there are no identifiers left.
        if (leftOverAttributeNode === undefined) {
            entity.removeChild(attributesNode);
        }

        return entity;
    }

    private findIdentifierReferencingAttributeId(identifiersNode: Node, attributeId: string) {
        return this.findChildNode(identifiersNode, (node) => {
            if (node.nodeName !== 'o:Identifier') return false;
            const identifierReferencingAttributeId = this.findChildNode(this.findChildNode(node, node => node.nodeName === 'c:Identifier.Attributes'), node => node.nodeName === 'o:EntityAttribute' && (node as Element).getAttribute('Ref') === attributeId);

            return identifierReferencingAttributeId !== undefined
        });
    }

    removeIdentifierForEntity(entityId: string, attributeIdUsedForIdentifier: string) {
        const entity = this.findEntity(entityId);
        const identifiers = this.findChildNode(entity, (node) => node.nodeName === 'c:Identifiers');

        const primaryIdentifierNode = this.findChildNode(entity, (node) => node.nodeName === 'c:PrimaryIdentifier');
        const primaryIdentifierRefNode = primaryIdentifierNode === undefined ? undefined : this.findChildNode(primaryIdentifierNode, (node) => node.nodeName === 'o:Identifier' && (node as Element).getAttribute('Ref') === attributeIdUsedForIdentifier);

        const identifierNode = this.findIdentifierReferencingAttributeId(identifiers, attributeIdUsedForIdentifier);

        if (identifierNode !== undefined) {
            identifiers.removeChild(identifierNode);
        }

        if (primaryIdentifierNode !== undefined && primaryIdentifierRefNode === undefined) {
            entity.removeChild(primaryIdentifierNode);
        }

        // Try to find a leftover identifier
        const leftOverIdentifierNode = this.findChildNode(identifiers, (node) => node.nodeName === 'o:Identifier');

        // Remove identifiers element if there are no identifiers left.
        if (leftOverIdentifierNode === undefined) {
            entity.removeChild(identifiers);
        }

        return entity;
    }

    addIdentifierForEntity(entityId: string, attributeIdUsedForIdentifier: string, isPrimaryIdentifier: boolean) {
        const entity = this.findEntity(entityId);
        let identifiers = this.findChildNode(entity, (node) => node.nodeName === 'c:Identifiers');
        let primaryIdentifierNode = this.findChildNode(entity, (node) => node.nodeName === 'c:PrimaryIdentifier');
        let primaryIdentifierRefNode = primaryIdentifierNode === undefined ? undefined : this.findChildNode(primaryIdentifierNode, (node) => node.nodeName === 'o:Identifier');

        const identifierId = this.getNextUniqueId();

        if (identifiers === undefined) {
            identifiers = this.document.createElement('c:Identifiers');
            entity.appendChild(identifiers);
        }

        if (primaryIdentifierNode === undefined && isPrimaryIdentifier) {
            primaryIdentifierNode = this.document.createElement('c:PrimaryIdentifier');
            primaryIdentifierRefNode = this.document.createElement('o:Identifier');
            primaryIdentifierNode.appendChild(primaryIdentifierRefNode);
            entity.appendChild(primaryIdentifierNode);
        }

        const identifierReferencingAttributeId = this.findIdentifierReferencingAttributeId(identifiers, attributeIdUsedForIdentifier);

        if (isPrimaryIdentifier && primaryIdentifierRefNode !== undefined) {
            primaryIdentifierRefNode.setAttribute('Ref', identifierReferencingAttributeId === undefined ? identifierId : identifierReferencingAttributeId.getAttribute('Id')!);
        }

        if (identifierReferencingAttributeId !== undefined) {
            const identifierIsCurrentlyThePrimaryIdentifier = primaryIdentifierNode !== undefined && primaryIdentifierRefNode !== undefined && primaryIdentifierRefNode.getAttribute('Ref') === identifierReferencingAttributeId.getAttribute('Id');

            if (!isPrimaryIdentifier && identifierIsCurrentlyThePrimaryIdentifier) {
                entity.removeChild(primaryIdentifierNode);
            }

            return entity;
        }


        const identifierNode = this.buildBasicNode('o:Identifier', 'Identifier_' + attributeIdUsedForIdentifier, {identifierId});

        const identifierAttributesNode = this.document.createElement('c:Identifier.Attributes');
        const attributeRefNode = this.document.createElement('o:EntityAttribute');
        attributeRefNode.setAttribute('Ref', attributeIdUsedForIdentifier);

        identifierAttributesNode.appendChild(attributeRefNode);
        identifierNode.appendChild(identifierAttributesNode);

        identifiers.appendChild(identifierNode);

        return entity;
    }

    private findNodeById(parentNode: Node, type: string, id: string) {
        return this.findChildNode(parentNode, (node) => {
            return node.nodeName === type && (node as Element).getAttribute('Id') === id
        });
    }

    private findDomainById(domainsNode: Node, id: string) {
        return this.findNodeById(domainsNode, 'o:Domain', id);
    }

    private findRelationById(id: string) {
        return this.findNodeById(this.findNode('c:Relationships'), 'o:Relationship', id);

    }

    setDataTypeAndLengthForDomain(domainId: string, name: string, dataType: string, length: number) {
        const domain = this.findDomainById(this.findNode('c:Domains'), domainId);

        this.setAttributesOnNode(domain, {
            'a:Name': name,
            'a:DataType': DataTypeHelper.buildTypeIdentifier(dataType, length),
            'a:Length': length.toString(),
        });

        return domain;
    }

    removeDomain(domainId: string): boolean {
        if (this.getUsageCount(domainId) > 0) {
            return false;
        }

        const domainsNode = this.findNode('c:Domains');
        const domain = this.findDomainById(domainsNode, domainId);
        domainsNode.removeChild(domain);

        return true;
    }

    createDomain(name: string, dataType: string, length: number) {
        const domainsNode = this.findNode('c:Domains');

        const domainNode = this.buildBasicNode('o:Domain', name);

        this.setAttributesOnNode(domainNode, {
            'a:Name': name,
            'a:DataType': DataTypeHelper.buildTypeIdentifier(dataType, length),
            'a:Length': length.toString(),
        });

        domainsNode.appendChild(domainNode);

        return domainsNode;
    }


    setAttributeForRelation(relationId: string, attributeName: string, value: any) {
        const relation = this.findRelationById(relationId);

        this.setAttributesOnNode(relation, {
            [attributeName]: value
        });

        return relation;
    }

    setRefOfObjectInRelation(relationId: string, objectName: string, targetEntityId: string){
        const relationNode = this.findRelationById(relationId);

        let refNode = this.findChildNode(relationNode, (node) => {
            return node.nodeName === objectName
        });

        if(refNode === undefined){
            refNode = this.document.createElement(objectName);
            relationNode.appendChild(refNode);
        }

        let fromEntityRefNode = this.findChildNode(refNode, (node) => {
            return node.nodeName === 'o:Entity';
        });

        if(fromEntityRefNode === undefined){
            fromEntityRefNode = this.document.createElement('o:Entity');
            refNode.appendChild(fromEntityRefNode);
        }

        fromEntityRefNode.setAttribute("Ref", targetEntityId);

        return relationNode;
    }

    setFromRefOfRelation(relationId: string, targetEntityId: string) {
        return this.setRefOfObjectInRelation(relationId, 'c:Object1', targetEntityId);
    }

    setToRefOfRelation(relationId: string, targetEntityId: string) {
        return this.setRefOfObjectInRelation(relationId, 'c:Object2', targetEntityId);
    }

    setFromCardinalityOfRelation(relationId: string, nextCardinality: string){
        this.setAttributeForRelation(relationId, 'a:Entity1ToEntity2RoleCardinality', nextCardinality);
    }

    setToCardinalityOfRelation(relationId: string, nextCardinality: string){
        this.setAttributeForRelation(relationId, 'a:Entity2ToEntity1RoleCardinality', nextCardinality);
    }

    createRelation(sourceEntityId: string, targetEntityId: string, name: string, cardinality: string){
        const relationships = this.findNode('c:Relationships');
        const relationshipNode = this.buildBasicNode('o:Relationship',name);

        const relationId = relationshipNode.getAttribute('Id')!;

        relationships.appendChild(relationshipNode);

        this.setFromRefOfRelation(relationId, sourceEntityId);
        this.setToRefOfRelation(relationId, targetEntityId);
        this.setToCardinalityOfRelation(relationId, cardinality);
        this.setFromCardinalityOfRelation(relationId, cardinality);

        return relationshipNode;
    }

    deleteRelation(relationId: string){
        const relationships = this.findNode('c:Relationships');
        const relationship = this.findNodeById(relationships, 'o:Relationship', relationId);

        relationships.removeChild(relationship);
    }

    private buildBasicNode(nodeName: string, name: string, overrides: {identifierId?: string, code?: string, objectId?: string}= {identifierId: undefined, code: undefined, objectId: undefined}) {
        const node = this.document.createElement(nodeName);
        node.setAttribute('Id', overrides.identifierId === undefined ? this.getNextUniqueId() : overrides.identifierId);

        this.setAttributesOnNode(node, {
            'a:ObjectID': overrides.objectId || this.getUid(),
            'a:CreationDate': '1556190897',
            'a:Creator': 'webversion',
            'a:ModificationDate': '1556190923',
            'a:Modifier': 'webversion',
            'a:Name': name,
            'a:Code': overrides.code || this.getUid()
        });

        return node;
    }

    private setAttributesOnNode(node: Node, attributes: { [key: string]: string }) {
        for (let attributeName in attributes) {
            let attributeNode = this.findChildNode(node, node => node.nodeName === attributeName);

            if (attributeNode === undefined) {
                attributeNode = this.document.createElement(attributeName);
                attributeNode.appendChild(this.document.createTextNode(attributes[attributeName]));

                node.appendChild(attributeNode);
            }

            const valueNode = attributeNode.firstChild as Text;
            valueNode.data = attributes[attributeName];
        }
    }

    private getUsageCount(id: string) {
        const refIdPattern = /Ref="(o[0-9]+)"/g;

        return (this.getAsXml().match(refIdPattern) || []).filter(x => x.replace(refIdPattern, '$1') === id).length;
    }

    private getNextUniqueId() {
        const idPattern = /Id="o([0-9]+)"/g;
        const ids = (this.getAsXml().match(idPattern) || []).map(x => parseInt(x.replace(idPattern, '$1')));

        const nextId = Math.max(...ids) + 1;

        return 'o' + nextId;
    }

    getUid(){
        return uid().toUpperCase();
    }

    getAsXml() {
        return new XMLSerializer().serializeToString(this.document.documentElement);
    }
}

export default CDMModel;
