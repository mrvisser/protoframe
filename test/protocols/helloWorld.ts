import { ProtoframeDescriptor } from '../../src';

export type HelloWorldProtocol = {
  hello: {
    body: {
      name: string;
    };
    response: {
      value: string;
    };
  };
  get: {
    body: {
      name: string;
    };
    response: {
      value: string;
    };
  };
};

export const helloWorldProtocol: ProtoframeDescriptor<HelloWorldProtocol> = {
  type: 'helloWorld',
};
