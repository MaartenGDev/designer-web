import xml2js from 'xml2js';
import IModel from "../models/IModel";
import IAttribute from "../models/IAttribute";
import IRelation from "../models/IRelation";
import IRectangleCoordinates from "../models/IRectangleCoordinates";
import IDomain from "../models/IDomain";

const xmlParser = new xml2js.Parser();

const getAsJson = (model: any): IModel => {
    const rootModel = model['Model']['o:RootObject'][0]['c:Children'][0]['o:Model'][0];

    const physicalDiagrams = rootModel.hasOwnProperty('c:PhysicalDiagrams')
        ? rootModel['c:PhysicalDiagrams'][0]
        : null;

    const conceptualDiagrams = rootModel.hasOwnProperty('c:ConceptualDiagrams')
        ? rootModel['c:ConceptualDiagrams'][0]
        : null;

    const isPhysicalDiagram = conceptualDiagrams === null;

    const diagram = isPhysicalDiagram
        ? physicalDiagrams['o:PhysicalDiagram'][0]
        : conceptualDiagrams['o:ConceptualDiagram'][0];

    const entitiesKey = isPhysicalDiagram ? 'c:Tables' : 'c:Entities';
    const entityObjectKey = isPhysicalDiagram ? 'o:Table' : 'o:Entity';

    const entities = rootModel.hasOwnProperty(entitiesKey)
        ? rootModel[entitiesKey][0][entityObjectKey]
        : [];

    const symbolKey = isPhysicalDiagram ? 'o:TableSymbol' : 'o:EntitySymbol';
    const symbolObjectKey = isPhysicalDiagram ? 'o:Table' : 'o:Entity';

    const coordinatesByEntityId = diagram.hasOwnProperty('c:Symbols')
        ? diagram['c:Symbols'][0][symbolKey].reduce((acc: { [key: string]: IRectangleCoordinates }, symbol: any) => {
            const [x1, y2, x2, y1] = symbol['a:Rect'][0].replace(/\(|\)/g, '').split(',').map((coordinate: string) => parseInt(coordinate));

            acc[symbol['c:Object'][0][symbolObjectKey][0]['$'].Ref] = {
                topLeft: {x: x1, y: y1},
                bottomRight: {x: x2, y: y2}
            };

            return acc;
        }, {})
        : {};


    const domainObjectKey = isPhysicalDiagram ? 'o:PhysicalDomain' : 'o:Domain';

    const domains = rootModel.hasOwnProperty('c:Domains')
        ? rootModel['c:Domains'][0][domainObjectKey].reduce((acc: { [key: string]: IDomain }, cur: any) => {
            acc[cur['$'].Id] = {
                id: cur['$'].Id,
                name: cur['a:Name'][0],
                code: cur['a:Code'][0],
                dataType: cur.hasOwnProperty('a:DataType') ? cur['a:DataType'][0] : '',
                length: cur.hasOwnProperty('a:Length') ? cur['a:Length'][0] : 0,
            };
            return acc;
        }, {})
        : [];

    const getAsAttribute = (data: any): IAttribute => ({
        id: data['$'].Id,
        name: data['a:Name'][0],
        dataType: data.hasOwnProperty('a:DataType') ? data['a:DataType'][0] : '',
        length: data.hasOwnProperty('a:Length') ? data['a:Length'][0] : 0,
        domainId: data.hasOwnProperty('c:Domain') ? data['c:Domain'][0][domainObjectKey][0]['$'].Ref : undefined,
        dataItemId: data.hasOwnProperty('c:DataItem') ? data['c:DataItem'][0]['o:DataItem'][0]['$'].Ref : undefined,
    });

    const dataItems: { [key: string]: IAttribute } = rootModel.hasOwnProperty('c:DataItems')
        ? rootModel['c:DataItems'][0]['o:DataItem'].reduce((acc: { [key: string]: IAttribute }, cur: any) => {
            acc[cur['$'].Id] = getAsAttribute(cur);
            return acc;
        }, {})
        : [];

    const relationsKey = isPhysicalDiagram ? 'c:References' : 'c:Relationships';
    const relationObjectKey = isPhysicalDiagram ? 'o:Reference' : 'o:Relationship';


    const relationFirstObjectKey = isPhysicalDiagram ? 'c:ParentTable' : 'c:Object1';
    const relationSecondObjectKey = isPhysicalDiagram ? 'c:ChildTable' : 'c:Object2';

    const relationRefObjectKey = isPhysicalDiagram ? 'o:Table' : 'o:Entity';

    const relations: IRelation[] = rootModel.hasOwnProperty(relationsKey)
        ? rootModel[relationsKey][0][relationObjectKey].map((relation: any) => ({
            id: relation['$'].Id,
            name: relation['a:Name'][0],
            from: {
                ref: relation[relationFirstObjectKey][0][relationRefObjectKey][0]['$'].Ref,
                cardinality: isPhysicalDiagram ? relation['a:Cardinality'][0] : relation['a:Entity1ToEntity2RoleCardinality'][0]
            },
            to: {
                ref: relation[relationSecondObjectKey][0][relationRefObjectKey][0]['$'].Ref,
                cardinality: isPhysicalDiagram ? relation['a:Cardinality'][0] : relation['a:Entity2ToEntity1RoleCardinality'][0]
            },
        }))
        : [];

    const attributesKey = isPhysicalDiagram ? 'c:Columns' : 'c:Attributes';
    const attributeObjectKey = isPhysicalDiagram ? 'o:Column' : 'o:EntityAttribute';

    return {
        entities: entities.map((entity: any) => {
            return {
                id: entity['$'].Id,
                uid: entity['a:ObjectID'][0],
                name: entity['a:Name'][0],
                attributes: entity.hasOwnProperty(attributesKey)
                    ? entity[attributesKey][0][attributeObjectKey].map((attribute: any) => {
                        const dataItemId = attribute.hasOwnProperty('c:DataItem')
                            ? attribute['c:DataItem'][0]['o:DataItem'][0]['$'].Ref
                            : undefined;

                        return dataItemId !== undefined
                            ? {...dataItems[dataItemId], dataItemId}
                            : {...getAsAttribute(attribute), dataItemId}
                    })
                    : [],
                identifiers: entity.hasOwnProperty('c:Identifiers')
                    ? entity['c:Identifiers'][0]['o:Identifier'].map((attribute: any) => ({
                        id: attribute['$'].Id,
                        attributeId: attribute.hasOwnProperty('c:Identifier.Attributes') ? attribute['c:Identifier.Attributes'][0]['o:EntityAttribute'][0]['$'].Ref : undefined,
                        isPrimary: entity.hasOwnProperty('c:PrimaryIdentifier') ? entity['c:PrimaryIdentifier'][0]['o:Identifier'][0]['$'].Ref === attribute['$'].Id : false
                    }))
                    : [],
                location: coordinatesByEntityId[entity['$'].Id]
            }
        }),
        domains,
        dataItems,
        relations
    };
};

export default (modelAsXml: string, callback: (data: IModel) => void) => {
    xmlParser.parseString(modelAsXml, (err: string, result: any) => {
        callback(getAsJson(result));
    });
};

