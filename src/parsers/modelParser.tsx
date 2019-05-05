import xml2js from 'xml2js';
import IModel from "../models/IModel";
import IAttribute from "../models/IAttribute";
import IRelation from "../models/IRelation";
import IRectangleCoordinates from "../models/IRectangleCoordinates";
import IDomain from "../models/IDomain";

const xmlParser = new xml2js.Parser();

const getAsJson = (model: any): IModel => {
    const rootModel = model['Model']['o:RootObject'][0]['c:Children'][0]['o:Model'][0];

    const entities = rootModel['c:Entities'][0]['o:Entity'];

    const coordinatesByEntityId = rootModel['c:ConceptualDiagrams'][0]['o:ConceptualDiagram'][0]['c:Symbols'][0]['o:EntitySymbol'].reduce((acc: { [key: string]: IRectangleCoordinates }, symbol: any) => {
        const [x1, y2, x2, y1] = symbol['a:Rect'][0].replace(/\(|\)/g, '').split(',').map((coordinate: string) => parseInt(coordinate));

        acc[symbol['c:Object'][0]['o:Entity'][0]['$'].Ref] = {
            topLeft: {x: x1, y: y1},
            bottomRight: {x: x2, y: y2}
        };

        return acc;
    }, {});

    const domains = rootModel['c:Domains'][0]['o:Domain'].reduce((acc: { [key: string]: IDomain }, cur: any) => {
        acc[cur['$'].Id] = {
            id: cur['$'].Id,
            name: cur['a:Name'][0],
            code: cur['a:Code'][0],
            dataType: cur.hasOwnProperty('a:DataType') ? cur['a:DataType'][0] : '',
            length: cur.hasOwnProperty('a:Length') ? cur['a:Length'][0] : 0,
        };
        return acc;
    }, {});

    const dataItems: { [key: string]: IAttribute } = rootModel['c:DataItems'][0]['o:DataItem'].reduce((acc: { [key: string]: IAttribute }, cur: any) => {
        acc[cur['$'].Id] = {
            id: cur['$'].Id,
            name: cur['a:Name'][0],
            dataType: cur.hasOwnProperty('a:DataType') ? cur['a:DataType'][0] : '',
            length: cur.hasOwnProperty('a:Length') ? cur['a:Length'][0] : 0,
            domainId: cur.hasOwnProperty('c:Domain') ? cur['c:Domain'][0]['o:Domain'][0]['$'].Ref : undefined
        };
        return acc;
    }, {});

    const relations: IRelation[] = !rootModel.hasOwnProperty('c:Relationships')
        ? []
        : rootModel['c:Relationships'][0]['o:Relationship'].map((relation: any) => ({
            id: relation['$'].Id,
            name: relation['a:Name'][0],
            from: {
                ref: relation['c:Object1'][0]['o:Entity'][0]['$'].Ref,
                cardinality: relation['a:Entity1ToEntity2RoleCardinality'][0]
            },
            to: {
                ref: relation['c:Object2'][0]['o:Entity'][0]['$'].Ref,
                cardinality: relation['a:Entity2ToEntity1RoleCardinality'][0]
            },
        }));

    return {
        entities: entities.map((entity: any) => {
            return {
                id: entity['$'].Id,
                uid: entity['a:ObjectID'][0],
                name: entity['a:Name'][0],
                attributes: entity['c:Attributes'][0]['o:EntityAttribute'].map((attribute: any) => ({
                    id: attribute['$'].Id,
                    dataItemId: attribute['c:DataItem'][0]['o:DataItem'][0]['$'].Ref
                })),
                identifiers: entity.hasOwnProperty('c:Identifiers')
                    ? entity['c:Identifiers'][0]['o:Identifier'].map((attribute: any) => ({
                        id: attribute['$'].Id,
                        attributeId: attribute['c:Identifier.Attributes'][0]['o:EntityAttribute'][0]['$'].Ref,
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

var logger = (data: any) => {
    console.log(data)
    return true;
}

export default (modelAsXml: string, callback: (data: IModel) => void) => {
    xmlParser.parseString(modelAsXml, (err: string, result: any) => {
        callback(getAsJson(result));
    });
};

