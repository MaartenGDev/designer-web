import {DOMParser, XMLSerializer} from 'xmldom'

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

    setDomainForDataItem(dataItemId: string, nextDomainId: string): Element {
        const dataItem = this.findChildNode(this.findNode('c:DataItems'), (node) => {
            return node.nodeName === 'o:DataItem' && (node as Element).getAttribute('Id') === dataItemId
        });

        const domainForDataItem = this.findChildNode(this.findChildNode(dataItem, (node) => {
            return node.nodeName === 'c:Domain'
        }), (node) => {
            return node.nodeName === 'o:Domain'
        });

        domainForDataItem.setAttribute("Ref", nextDomainId);

        return dataItem;
    }

    getAsXml() {
        return new XMLSerializer().serializeToString(this.document.documentElement);
    }
}

export default CDMModel;
