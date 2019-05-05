import {DOMParser, XMLSerializer} from 'xmldom'
import IEntityIdentifier from "../models/IEntityIdentifier";

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

    removeIdentifierForEntity(entityId: string, attributeIdUsedForIdentifier: string) {
        const entity = this.findEntity(entityId);
        const identifiers = this.findChildNode(entity, (node) => node.nodeName === 'c:Identifiers');

        const identifierNode = this.findChildNode(identifiers, (node) => {
            if(node.nodeName !== 'o:Identifier') return false;
            const identifierReferencingAttributeId = this.findChildNode(this.findChildNode(node, node => node.nodeName === 'c:Identifier.Attributes'), node => node.nodeName === 'o:EntityAttribute' && (node as Element).getAttribute('Ref') === attributeIdUsedForIdentifier);

            return identifierReferencingAttributeId !== undefined
        });

        if (identifierNode !== undefined) {
            identifiers.removeChild(identifierNode);
        }

        // Try to find a leftover identifier
        const leftOverIdentifierNode = this.findChildNode(identifiers, (node) => node.nodeName === 'o:Identifier');

        // Remove identifiers element if there are no identifiers left.
        if (leftOverIdentifierNode === undefined) {
            entity.removeChild(identifiers);
        }

        return entity;
    }

    addIdentifierForEntity(entityId: string, attributeIdUsedForIdentifier: string) {
        const entity = this.findEntity(entityId);
        let identifiers = this.findChildNode(entity, (node) => node.nodeName === 'c:Identifiers');

        if(identifiers === undefined){
            identifiers = this.document.createElement('c:Identifiers');
            entity.appendChild(identifiers);
        }

        const identifierNode =  this.document.createElement('o:Identifier');
        identifierNode.setAttribute('Id', 'oSHOULDFIX'); // TODO: implement id generator logic


        const uidAttribute = this.document.createElement('a:ObjectID');
        uidAttribute.appendChild(this.document.createTextNode('114ACC4B-ADEA-4F85-8058-0C0F16DD0A62')); // TODO: implement uid generator logic

        const nameAttribute = this.document.createElement('a:Name');
        nameAttribute.appendChild(this.document.createTextNode('Identifier_' + attributeIdUsedForIdentifier));

        const codeAttribute = this.document.createElement('a:Code');
        codeAttribute.appendChild(this.document.createTextNode('Identifier_' + attributeIdUsedForIdentifier));

        identifierNode.appendChild(uidAttribute);
        identifierNode.appendChild(nameAttribute);
        identifierNode.appendChild(codeAttribute);

        const identifierAttributesNode = this.document.createElement('c:Identifier.Attributes');
        const attributeRefNode = this.document.createElement('o:EntityAttribute');

        attributeRefNode.setAttribute('Ref', attributeIdUsedForIdentifier);
        identifierAttributesNode.appendChild(attributeRefNode);
        identifierNode.appendChild(identifierAttributesNode);

        identifiers.appendChild(identifierNode);

        return entity;
    }


    getAsXml() {
        return new XMLSerializer().serializeToString(this.document.documentElement);
    }
}

export default CDMModel;
