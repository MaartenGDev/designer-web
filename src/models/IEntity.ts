import IRectangleCoordinates from "./IRectangleCoordinates";

interface IEntity {
    id: string,
    name: string
    attributeIds: string[],
    location: IRectangleCoordinates
}

export default IEntity;
