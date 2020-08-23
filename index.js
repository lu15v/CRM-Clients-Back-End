const {ApolloServer} = require('apollo-server');
const typeDefs = require('./db/schema');
const resolvers = require('./db/resolver');
const connectDB = require('./config/db');
const jwt = require('jsonwebtoken');

require('dotenv').config({path: 'variables.env'});

//DB connection
connectDB();

//server
const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({req}) =>{
        //console.log(req.headers["authorization"])
        const token = req.headers["authorization"] || '';
        if(token) {
            try{
                const user = jwt.verify(token, process.env.SECRET);

                return {
                    user
                }
            }catch(error){
                console.log(error);
            }
        }
    }
});


//Start server
server.listen().then( ({url}) =>{
    console.log(`Server ready on port ${url}`)
})
