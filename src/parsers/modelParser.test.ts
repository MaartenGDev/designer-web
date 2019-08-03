import CDMModel from "./CDMModel";

it('updates the attribute and cardinality of relation correctly', () => {
    // Arrange
    const model = new CDMModel();
    const relationShipId = "o3";

    const newName = 'Hello World';
    const newFromCardinality = '1,1';
    const newToCardinality = '0,n';
    const newFromRef = 'o4';
    const newToRef = 'o4';


    model.loadFromXml(`<Model xmlns:a="attribute" xmlns:c="collection" xmlns:o="object">
    <o:RootObject Id="o1">
        <c:Children>
            <o:Model Id="o2">
                 <c:Relationships>
                    <o:Relationship Id="${relationShipId}">
                        <a:Name>SALESPOINT_OF_CINEMA</a:Name>
                        <a:Entity1ToEntity2RoleCardinality>1,n</a:Entity1ToEntity2RoleCardinality>
                        <a:Entity2ToEntity1RoleCardinality>1,n</a:Entity2ToEntity1RoleCardinality>
                        <c:Object1>
                            <o:Entity Ref="o113"/>
                        </c:Object1>
                        <c:Object2>
                            <o:Entity Ref="o112"/>
                        </c:Object2>
                    </o:Relationship>
                </c:Relationships>
            </o:Model>
        </c:Children>
    </o:RootObject>
</Model>`);

    // Act
    model.setAttributeForRelation(relationShipId, 'a:Name', newName);
    model.setFromCardinalityOfRelation(relationShipId, newFromCardinality);
    model.setToCardinalityOfRelation(relationShipId, newToCardinality);
    model.setFromRefOfRelation(relationShipId, newFromRef)
    model.setToRefOfRelation(relationShipId, newToRef)

    // Assert
    const expectedXML = `<Model xmlns:a="attribute" xmlns:c="collection" xmlns:o="object">
    <o:RootObject Id="o1">
        <c:Children>
            <o:Model Id="o2">
                 <c:Relationships>
                    <o:Relationship Id="${relationShipId}">
                        <a:Name>${newName}</a:Name>
                        <a:Entity1ToEntity2RoleCardinality>${newFromCardinality}</a:Entity1ToEntity2RoleCardinality>
                        <a:Entity2ToEntity1RoleCardinality>${newToCardinality}</a:Entity2ToEntity1RoleCardinality>
                        <c:Object1>
                            <o:Entity Ref="${newFromRef}"/>
                        </c:Object1>
                        <c:Object2>
                            <o:Entity Ref="${newToRef}"/>
                        </c:Object2>
                    </o:Relationship>
                </c:Relationships>
            </o:Model>
        </c:Children>
    </o:RootObject>
</Model>`;

    expect(model.getAsXml()).toEqual(expectedXML);
});

it('updates the attributes of entity correctly', () => {
    // Arrange
    const model = new CDMModel();
    const defaultUid = 'aaa-bbb';
    model.getUid = () => defaultUid;

    const entityId = "o3";
    const newEntityName = 'test';
    const newAttribute = {
        id: "o7",
        name: "test_attr",
        dataType: "varchar",
        length: 20
    };
    model.loadFromXml(`<Model xmlns:a="attribute" xmlns:c="collection" xmlns:o="object">
    <o:RootObject Id="o1">
        <c:Children>
            <o:Model Id="o2">
                 <c:Entities>
                    <o:Entity Id="${entityId}">
                        <a:Name>BLOCK_REASONS</a:Name>
                        <c:Identifiers>
                            <o:Identifier Id="o254">
                                <a:Name>Identifier_1</a:Name>
                            </o:Identifier>
                        </c:Identifiers>
                        <c:PrimaryIdentifier>
                            <o:Identifier Ref="o254"/>
                        </c:PrimaryIdentifier>
                    </o:Entity>
                </c:Entities>
            </o:Model>
        </c:Children>
    </o:RootObject>
</Model>`);

    // Act
    model.setAttributeForEntity(entityId, 'a:Name', newEntityName);
    model.createAttributeForEntity(entityId, newAttribute.name, newAttribute.dataType, newAttribute.length);
    // Assert
    const expectedXML = `<Model xmlns:a="attribute" xmlns:c="collection" xmlns:o="object">
    <o:RootObject Id="o1">
        <c:Children>
            <o:Model Id="o2">
                 <c:Entities>
                    <o:Entity Id="${entityId}">
                        <a:Name>${newEntityName}</a:Name>
                        <c:Identifiers>
                            <o:Identifier Id="o254">
                                <a:Name>Identifier_1</a:Name>
                            </o:Identifier>
                        </c:Identifiers>
                        <c:PrimaryIdentifier>
                            <o:Identifier Ref="o254"/>
                        </c:PrimaryIdentifier>
                    <c:Attributes><o:EntityAttribute Id="o255"><a:ObjectID>${defaultUid}</a:ObjectID><a:CreationDate>1556190897</a:CreationDate><a:Creator>webversion</a:Creator><a:ModificationDate>1556190923</a:ModificationDate><a:Modifier>webversion</a:Modifier><a:Name>test_attr</a:Name><a:Code>${defaultUid}</a:Code><c:DataItem><o:DataItem Ref="o256"/></c:DataItem></o:EntityAttribute></c:Attributes></o:Entity>
                </c:Entities>
            <c:DataItems><o:DataItem Id="o256"><a:ObjectID>${defaultUid}</a:ObjectID><a:CreationDate>1556190897</a:CreationDate><a:Creator>webversion</a:Creator><a:ModificationDate>1556190923</a:ModificationDate><a:Modifier>webversion</a:Modifier><a:Name>test_attr</a:Name><a:Code>${defaultUid}</a:Code><a:DataType>varchar20</a:DataType><a:Length>20</a:Length></o:DataItem></c:DataItems></o:Model>
        </c:Children>
    </o:RootObject>
</Model>`;

    expect(model.getAsXml()).toEqual(expectedXML);
});