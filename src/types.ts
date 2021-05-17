/** The protocol type that holds your message types and their schema. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Protoframe = Record<string, ProtoframeEntry<any, any>>;
export type ProtoframeEntry<B, R extends Record<string, unknown>> = {
  body: B;
  response?: R;
};

/** Enumerates all valid types of messages defined in a given protocol. */
export type ProtoframeMessageType<P extends Protoframe> = string & keyof P;

/** Enumerates the `body` and `response` entry keys for each message. */
export type ProtoframeEntryType<
  P extends Protoframe,
  T extends ProtoframeMessageType<P>
> = string & keyof Protoframe[T];

/**
 * A type reference to the body or response type of a given message for a
 * protocol. If we have a simple protocol:
 *
 * ```
 * type MyProtocol = {
 *   get: {
 *     body: { key: string; }
 *   }
 * }
 * ```
 *
 * Then the type `ProtoframeEntryPropType<MyProtocol, 'get', 'body'>` references
 * type: `{ key: string }`.
 */
export type ProtoframeEntryPropType<
  P extends Protoframe,
  T extends ProtoframeMessageType<P>,
  E extends ProtoframeEntryType<P, T>
> = P[T][E];

/** A specialization of `ProtoframeEntryPropType` on the `body` key. */
export type ProtoframeMessageBody<
  P extends Protoframe,
  T extends ProtoframeMessageType<P>
> = ProtoframeEntryPropType<P, T, 'body'>;

/** A specialization of `ProtoframeEntryPropType` on the `response` key. */
export type ProtoframeMessageResponse<
  P extends Protoframe,
  T extends ProtoframeMessageType<P>
> = ProtoframeEntryPropType<P, T, 'response'>;

/**
 * A protocol definition. This is used to include value `type` which namespaces
 * communication across an iframe.
 */
export interface ProtoframeDescriptor<_P extends Protoframe> {
  type: string;
}

/** An internal payload body for a protocol message going between windows. */
export interface ProtoframePayloadBody<
  P extends Protoframe,
  T extends ProtoframeMessageType<P>
> {
  type: string;
  id: string;
  body: ProtoframeMessageBody<P, T>;
}

/** An internal payload response for a protocol message going between windows. */
export interface ProtoframePayloadResponse<
  P extends Protoframe,
  T extends ProtoframeMessageType<P>
> {
  type: string;
  id: string;
  response: ProtoframeMessageResponse<P, T>;
}

/** An internal enumerator for ask and tell actions. Used to namespace messages. */
export type ProtoframeAction = 'ask' | 'tell';
