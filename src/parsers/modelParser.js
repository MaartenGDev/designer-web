import xml2js from 'xml2js';

const xmlParser = new xml2js.Parser();

const getAsJson = (model) => {
  const entities = model['Model']['o:RootObject'][0]['c:Children'][0]['o:Model'][0]['c:Entities'][0]['o:Entity'];

  const coordinatesByEntityId = model['Model']['o:RootObject'][0]['c:Children'][0]['o:Model'][0]['c:ConceptualDiagrams'][0]['o:ConceptualDiagram'][0]['c:Symbols'][0]['o:EntitySymbol'].reduce((acc, symbol) => {
    const [x1, y2, x2, y1] = symbol['a:Rect'][0].replace(/\(|\)/g, '').split(',').map(x => parseInt(x));

    acc[symbol['c:Object'][0]['o:Entity'][0]['$'].Ref] = {
      topLeft: {x: x1, y: y1},
      bottomRight: {x: x2, y: y2}
    };

    return acc;
  }, {});

  const globalAttributes = model['Model']['o:RootObject'][0]['c:Children'][0]['o:Model'][0]['c:DataItems'][0]['o:DataItem'].reduce((acc, cur) => {
    acc[cur['$'].Id] = {
      id: cur['$'].Id,
      name: cur['a:Name'][0]
    };
    return acc;
  }, {});

  const relations = model['Model']['o:RootObject'][0]['c:Children'][0]['o:Model'][0]['c:Relationships'][0]['o:Relationship'].map(relation => ({
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
    entities: entities.map(entity => ({
      id: entity['$'].Id,
      name: entity['a:Name'][0],
      attributeIds: entity['c:Attributes'][0]['o:EntityAttribute'].map(attribute => attribute['c:DataItem'][0]['o:DataItem'][0]['$'].Ref),
      location: coordinatesByEntityId[entity['$'].Id]
    })),
    attributes: globalAttributes,
    relations
  };
};

export default (modelAsXml, callback) => {
  xmlParser.parseString(modelAsXml, function (err, result) {
    callback(getAsJson(result));
  });
};

