import xml2js from 'xml2js';

const xmlParser = new xml2js.Parser();

const getAsJson = (model) => {
  const entities = model['Model']['o:RootObject'][0]['c:Children'][0]['o:Model'][0]['c:Entities'][0]['o:Entity'];

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
    from: relation['c:Object1'][0]['o:Entity'][0]['$'].Ref,
    to: relation['c:Object2'][0]['o:Entity'][0]['$'].Ref
  }));

  return {
    entities: entities.map(entity => ({
      id: entity['$'].Id,
      name: entity['a:Name'][0],
      attributeIds: entity['c:Attributes'][0]['o:EntityAttribute'].map(attribute => attribute['c:DataItem'][0]['o:DataItem'][0]['$'].Ref)
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

