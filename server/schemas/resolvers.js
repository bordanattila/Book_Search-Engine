const { AuthenticationError } = require("apollo-server-express");
const { Book, User } = require("../models");
const { signToken } = require('../utils/auth');

const resolvers = {
  Query: {
    me: async (parent, { username, email, password }, context) => {
        if (context.user) {
          const userData = await User.findOne({ _id: context.user._id }).select('-__v -password').populate('savedBooks');

        return userData;
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
      saveBook: async (parent, { bookData }, context) => {
        if (context.user) {
          const updatedUser = await User.findOneAndUpdate(
            { _id: context.user._id },
            { $push: { savedBooks: bookData } },
            { new: true }
          )
          return updatedUser;
        }
        throw new AuthenticationError('You are not logged-in!');
      },
  
      removeBook: async (parent, { bookId }, context) => {
        if (context.user) {
          const updatedUser = await User.findOneAndUpdate(
            { _id: context.user._id },
            { $pull: { savedBooks: { bookId } } },
            { new: true }
          )
          return updatedUser;
        }
        throw new AuthenticationError("You need to be logged in!");
      }
  },
};

module.exports = resolvers;