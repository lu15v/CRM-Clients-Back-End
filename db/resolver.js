const User = require('../models/User');
const bcryptjs = require('bcryptjs');

//Resolver
const resolvers  = {
    Query: {
        getCourse: () => "something"
    },
    Mutation :{
        newUser: async (_, {input}) => {
            
            const {email, password} = input;
            //Check if the user exists.
            const userExists = await User.findOne({email});
            if(userExists){
                throw new Error('User already registered')
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

        }
    }
}

module.exports = resolvers;