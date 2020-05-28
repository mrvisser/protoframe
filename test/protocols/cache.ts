import { ProtoframeDescriptor } from '../../src';

export type CacheProtocol = {
  // Get a key from a cache
  get: {
    body: {
      key: string;
    };
    response: {
      value: string | null;
    };
  };
  // Set a key in a cache
  set: {
    body: {
      key: string;
      value: string;
    };
  };
  // Delete an item in the cache
  delete: {
    body: {
      key: string;
    };
  };
};

export const cacheProtocol: ProtoframeDescriptor<CacheProtocol> = {
  type: 'cache',
};
