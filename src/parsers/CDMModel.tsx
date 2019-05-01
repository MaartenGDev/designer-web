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

    setAttributeForEntity(entityId: string, attributeName: string, value: string) {
        const entity = Array.from(this.findNode('c:Entities').childNodes)
            .find(x => x.nodeName === 'o:Entity' && (x as Element).getAttribute('Id') === entityId) as Element;

        const valueNode = (Array.from(entity.childNodes).find(x => x.nodeName === attributeName) as Element).firstChild as Text;

        valueNode.data = value;
        return entity;
    }

    getAsXml() {
        return new XMLSerializer().serializeToString(this.document.documentElement);
    }
}

export default CDMModel;
