export default interface IRelation {
    id: string,
    name: string,
    from: {
        ref: string,
        cardinality: string
    },
    to: {
        ref: string,
        cardinality: string
    }
}