import IEntity from "./IEntity";
import IAttribute from "./IAttribute";
import IRelation from "./IRelation";
import IDomain from "./IDomain";

interface IModel {
    entities: IEntity[],
    attributes: { [key: string]: IAttribute },
    domains: { [key: string]: IDomain },
    relations: IRelation[],
}

export default IModel;
