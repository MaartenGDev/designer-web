import IRectangleCoordinates from "./IRectangleCoordinates";
import IEntityIdentifier from "./IEntityIdentifier";
import IAttribute from "./IAttribute";

interface IEntity {
    id: string,
    uid: string,
    name: string
    identifiers: IEntityIdentifier[],
    attributes: IAttribute[],
    location: IRectangleCoordinates
}

export default IEntity;
