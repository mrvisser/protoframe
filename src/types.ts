export type Protoframe = Record<string, ProtoframeEntry<never, never>>;

export type ProtoframeEntry<B, R extends {} | undefined> = {
  body: B;
  response: R;
};

export type ProtoframeMessageType<P extends Protoframe> = string & keyof P;

export type ProtoframeEntryType<
  P extends Protoframe,
  T extends ProtoframeMessageType<P>
> = string & keyof Protoframe[T];

export type ProtoframeEntryPropType<
  P extends Protoframe,
  T extends ProtoframeMessageType<P>,
  E extends ProtoframeEntryType<P, T>
> = P[T][E];

export type ProtoframeMessageBody<
  P extends Protoframe,
  T extends ProtoframeMessageType<P>
> = ProtoframeEntryPropType<P, T, 'body'>;

export type ProtoframeMessageResponse<
  P extends Protoframe,
  T extends ProtoframeMessageType<P>
> = ProtoframeEntryPropType<P, T, 'response'>;

export interface ProtoframeDescriptor<_P extends Protoframe> {
  type: string;
}

export interface ProtoframePayloadBody<
  P extends Protoframe,
  T extends ProtoframeMessageType<P>
> {
  type: string;
  body: ProtoframeMessageBody<P, T>;
}

export interface ProtoframePayloadResponse<
  P extends Protoframe,
  T extends ProtoframeMessageType<P>
> {
  type: string;
  response: ProtoframeMessageResponse<P, T>;
}

export type ProtoframeAction = 'ask' | 'tell';
