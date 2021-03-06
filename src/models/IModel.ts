import IEntity from "./IEntity";
import IAttribute from "./IAttribute";
import IRelation from "./IRelation";
import IDomain from "./IDomain";

export default interface IModel {
    entities: IEntity[],
    dataItems: { [key: string]: IAttribute },
    domains: { [key: string]: IDomain },
    relations: IRelation[],
}

