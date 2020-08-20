const {gql} = require('apollo-server');

//Schema
const typeDefs = gql`
    type Query {
        getCourse: String
    }
`;

module.exports = typeDefs;