const User = require('../models/User');
const Product = require('../models/Product');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');

require('dotenv').config({path: 'variables.env'});

const createToken = (user, secret, exp) => {
    const {id, email, name, lastName} = user;

    return jwt.sign({id, email, name, lastName}, secret, { expiresIn: exp})
}

//Resolver
const resolvers  = {
    Query: {
        getUser: async (_,{token}) => {
            const userId = await jwt.verify(token, process.env.SECRET);

            return userId;
        }
    },
    Mutation :{
        newUser: async (_, {input}) => {
            
            const {email, password} = input;
            //Check if the user exists.
            const userExists = await User.findOne({email});
            if(userExists){
                throw new Error('User already registered');
            }
            //Passwords Hashing
            //const salt = await bcryptjs.getSalt(10);
            input.password = await bcryptjs.hash(password, bcryptjs.genSaltSync(10));
            //save it to the db.
            try{
                const user = new User(input);
                user.save();
                return user;
            }
            catch(error){
                console.log(error)
            }
        },
        
        authUser:  async (_, {input}) => {
            const {email, password} = input;
            //User exists?
            const userExists = await User.findOne({email});
            if(!userExists){
                throw new Error('User does not exists');
            }

            //Check if the password is ok
            const correctPass = await bcryptjs.compare(password, userExists.password);

            if(!correctPass){
                throw new Error('Wrong password');
            }
            //Create Token
            return {
                token: createToken(userExists, process.env.SECRET, '24h')
            }
        },
        newProduct: async  (_, {input}) => {
            try{
                const product = new Product(input);
                product.save();
                return product;
            }
            catch(error){
                console.log(error);
            }
        }
    }
}

module.exports = resolvers;