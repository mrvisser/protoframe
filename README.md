# Protoframe

[![Build Status](https://travis-ci.org/mrvisser/protoframe.svg?branch=master)](https://travis-ci.org/mrvisser/protoframe)

A small (dependency-free) library for 2-way iframe communication.

## Problem

You are embedding an iframe where you would like to communicate with the
following facilities:

1. From your parent page, you need to use `iframe.contentWindow.postMessage`
2. From your iframe, you need to subscribe to these messages using
   `window.addEventListener('message', (ev) => ...)`
3. And vice versa, sometimes at the same time

## Solution

This library allows you to define a protocol for this type of communication
supporting both fire-and-forget (`tell`) semantics, as well as request/response
(`ask`) semantics. It provides connector constructors that will facilitate the
sending and receiving these messages across parent and iframe windows.

## How?

`npm install protoframe --save`

### ProtoframeDescriptor

```typescript
import { ProtoframeDescriptor } from 'protoframe';

const cacheProtocol: ProtoframeDescriptor<{
  getFoo: {
    body: { key: string };
    response: { value: string };
  };
  setBar: {
    body: { key: string; value: string };
  };
}> = { type: 'cache' };
```

The `ProtoframeDescriptor` defines 2 elements of your protocol:

1. The message types. The type argument is a structural type that defines the
   message types as its top level key. For each message type, it defines the
   `body` type of the payload (for `ask` and `tell` requests), and an optional
   `response` types (for `ask` requests). An `ask` message must define a
   `response` key, a `tell` message must not
2. The value of the descriptor (`{type: 'cache'}`) defines a type key for the
   protocol, which is used to key on specific types of messages to listen to
   between the pages

### Connectors

The connector allows 2-way communication between a page and its iframe. For
example, we have a page that wishes to use an iframe as a "cache" server:

**Iframe:**

```typescript
import { ProtoframePubsub } from 'protoframe';

// Will hold our cache state
const data: { [key: string]: string } = {};

// The connector. This function creates a connector that listens for messages
// on `window` and sends messages and responses over `window.parent`
const cache = ProtoframePubsub.iframe(cacheProtocol);

// Implement our handlers for the ask and tell requests defined in the protocol
cache.handleTell('setBar', ({ key, value }) => (data[key] = value));
cache.handleAsk('getFoo', async ({ key }) => {
  const value = key in data ? data[key] : null;
  return { value };
});
```

**Parent:**

```typescript
import { ProtoframePubsub } from 'protoframe';

const iframe = document.getElementById('myCacheServerIframe');
const client = ProtoframePubsub.parent(cacheProtocol, iframe);

// Wait for the iframe page to load and for the connector to be instantiated
ProtoframePubsub.connect(client).then(() => {
  client.tell('setBar', { key: 'my key', value: 'my value' });

  // value = { value: 'my value' }
  const value = await client.ask('getFoo', { key: 'my key' });
});
```
