import IRectangleCoordinates from "./IRectangleCoordinates";
import IEntityAttribute from "./IEntityAttribute";
import IEntityIdentifier from "./IEntityIdentifier";

interface IEntity {
    id: string,
    name: string
    identifiers: IEntityIdentifier[],
    attributes: IEntityAttribute[],
    location: IRectangleCoordinates
}

export default IEntity;
