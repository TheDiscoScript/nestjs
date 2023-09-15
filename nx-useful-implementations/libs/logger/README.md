# logger

This library was generated with [Nx](https://nx.dev).

## Description

Extension of the NestJS Console logger. I like NestJS logger, but I wanted to add some more features to it.
We will extend logger with option to send Errors to Sentry.

I will add additional optional note, reqId and additional data for Sentry.

### Goals

-   Sending error to database automatically? (if MongoDB connection is available and configured)

## Running unit tests

Run `nx test logger` to execute the unit tests via [Jest](https://jestjs.io).
