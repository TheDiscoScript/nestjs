# mongodb

This library was generated with [Nx](https://nx.dev).

## Description

Implementation of a MongoDB database connection without using Mongoose.
Implementing BaseRepository pattern for eazy abstraction of the collections.
I also chose {result?:Entity, error?:Error} as the return type for the methods, so that I can handle the errors in the service layer. I like it that way.

### Goals

-   One more level of abstraction on repositories.
-   I don't like current implementation of find in BaseRepository
-   Implement find with pagination - not sure if it work properly now

## Running unit tests

Run `nx test mongodb` to execute the unit tests via [Jest](https://jestjs.io).
