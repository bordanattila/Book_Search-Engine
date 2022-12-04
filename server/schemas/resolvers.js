const { AuthenticationError } = require("apollo-server-express");
const { Book, User } = require("../models");
const { signToken } = require('../utils/auth');

const resolvers = {
  Query: {
    users: async () => {
      return User.find();
    },
    user: async (parent, { userId }) => {
      return User.findOne({ _id: userId });
    },
    me: async (parent, args, context) => {
        if (context.user) {
          return User.findOne({ _id: context.user._id });
        }
        throw new AuthenticationError("You need to be logged in!");
      },
  },
  Mutation: {
    login: async (parent, { email, password }) => {
        // Look up the user by the provided email address. Since the `email` field is unique, only one person will exist with that email
        const user = await User.findOne({ email });
  
        // If there is no user with that email address, return an Authentication error 
        if (!user) {
          throw new AuthenticationError("No user found with this email address");
        }
  
        // If there is a user found, execute the `isCorrectPassword` instance method and check if the correct password was provided
        const correctPassword = await user.isCorrectPassword(password);
  
        // If the password is incorrect, return an Authentication error 
        if (!correctPassword) {
          throw new AuthenticationError("Incorrect credentials");
        }
  
        // If email and password are correct, sign user into the application with a JWT
        const token = signToken(user);
  
        // Return an `Auth` object that consists of the signed token and user"s information
        return { token, user };
      },
      addUser: async (parent, { username, email, password }) => {
        // Create the user
        const user = await User.create({ username, email, password });
        // Sign a JSON Web Token and log the user in after they are created
        const token = signToken(user);
        // Return an `Auth` object that consists of the signed token and user"s information
        return { token, user };
      },
      saveBook: async (parent, { authors, description, title, bookId, image, link }) => {
        const book = await Book.create({ authors, description, title, bookId, image, link });
  
        await User.findOneAndUpdate(
          { _id: context.user._id },
          { $addToSet: { savedBooks: book._id } }
        );
  
        return book;
      },
      removeBook: async (parent, { bookId }, context) => {
        if (context.user) {
            const book = await Book.findOneAndDelete({
                _id: bookId,
            });

            await User.findOneAndUpdate(
                { _id: context.user._id },
                { $pull: { savedBooks: book._id}}
            );

            return book;
        }
        throw new AuthenticationError("You need to be logged in!");
      }
  },
};

module.exports = resolvers;