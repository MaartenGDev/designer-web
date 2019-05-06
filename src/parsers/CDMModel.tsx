import {DOMParser, XMLSerializer} from 'xmldom'
import uid from 'uuid/v4';
import {DataTypeHelper} from "../helpers/DataTypeHelper";

class CDMModel {
    private document: Document = new Document();

    public loadFromXml(xml: string) {
        this.document = new DOMParser().parseFromString(xml);
    }

    public findNode(pathRelativeFromModel: string) {
        return this.getNestedAttribute(this.document, 'o:RootObject.c:Children.o:Model.' + pathRelativeFromModel);
    }

    private getNestedAttribute(document: Document, path: string): Element {
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

        const dataItemsNode = this.findNode('c:DataItems');
        const dataItem = this.buildBasicNode('o:DataItem', name);

        this.addAttributesToNode(dataItem, {
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


        const identifierNode = this.buildBasicNode('o:Identifier', 'Identifier_' + attributeIdUsedForIdentifier, identifierId);

        const identifierAttributesNode = this.document.createElement('c:Identifier.Attributes');
        const attributeRefNode = this.document.createElement('o:EntityAttribute');
        attributeRefNode.setAttribute('Ref', attributeIdUsedForIdentifier);

        identifierAttributesNode.appendChild(attributeRefNode);
        identifierNode.appendChild(identifierAttributesNode);

        identifiers.appendChild(identifierNode);

        return entity;
    }

    setDataTypeAndLengthForDomain(domainId: string, name: string, dataType: string, length: number) {
        const domain = this.findChildNode(this.findNode('c:Domains'), (node) => {
            return node.nodeName === 'o:Domain' && (node as Element).getAttribute('Id') === domainId
        });

        const nameNode = this.findChildNode(domain, node => node.nodeName === 'a:Name');
        const nameValueNode = nameNode.firstChild as Text;
        nameValueNode.data = name;

        const dataTypeNode = this.findChildNode(domain, node => node.nodeName === 'a:DataType');
        const dataTypeValueNode = dataTypeNode.firstChild as Text;
        dataTypeValueNode.data = DataTypeHelper.buildTypeIdentifier(dataType, length);

        const lengthNode = this.findChildNode(domain, node => node.nodeName === 'a:Length');
        const lengthValueNode = lengthNode.firstChild as Text;
        lengthValueNode.data = length.toString();

        return domain;
    }

    private buildBasicNode(nodeName: string, name: string, identifierId?: string, code?: string) {
        const node = this.document.createElement(nodeName);
        node.setAttribute('Id', identifierId === undefined ? this.getNextUniqueId() : identifierId);

        this.addAttributesToNode(node, {
            'a:ObjectID': uid().toUpperCase(),
            'a:CreationDate': '1556190897',
            'a:Creator': 'webversion',
            'a:ModificationDate': '1556190923',
            'a:Modifier': 'webversion',
            'a:Name': name,
            'a:Code': code || name
        });

        return node;
    }

    private addAttributesToNode(node: Node, attributes: { [key: string]: string }) {
        for (let attributeName in attributes) {
            const attributeNode = this.document.createElement(attributeName);
            attributeNode.appendChild(this.document.createTextNode(attributes[attributeName]));

            node.appendChild(attributeNode);
        }
    }

    getAsXml() {
        return new XMLSerializer().serializeToString(this.document.documentElement);
    }

    private getNextUniqueId() {
        const idPattern = /Id="o([0-9]+)"/g;
        const ids = (this.getAsXml().match(idPattern) || []).map(x => parseInt(x.replace(idPattern, '$1')));
        const nextId = Math.max(...ids) + 1;

        return 'o' + nextId;
    }
}

export default CDMModel;
