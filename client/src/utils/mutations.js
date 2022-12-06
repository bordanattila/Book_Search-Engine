import { gql } from "@apollo/client";

export const LOGIN_USER = gql`
    mutation login($email: String!, $password: String!) {
        login(email: $email, password: $password) {
        token
        user {
            _id
            username
         
        }
        }
    }    
`;

export const ADD_USER = gql`
    mutation addUser($username: String!, $email: String!, $password: String!) {
        addUser(username: $username, email: $email, password: $password) {
            token
            user {
                _id
                username
               
            }
        }
    }
`;

export const SAVE_BOOK = gql`
    mutation saveBook($authors: String!, $description: String!, $title: String!, $bookId: String!, $link: String!) {
        saveBook(authors: $authors, description: $description, title: $title, bookId: $bookId, link: $link) {
            
                authors
                description
                title
                bookId
                link
            
        }
    }
`;

export const REMOVE_Book = gql`
    mutation removeBook($bookId: String!) {
        removeBook(bookId: $bookId) {
            _id
            authors
            description
            title
            bookId
            link
        }
    }
`;