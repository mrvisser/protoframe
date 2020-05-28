import {
  ProtoframeSubscriber,
  ProtoframePublisher,
  ProtoframePubsub,
} from '../src';
import { cacheProtocol, CacheProtocol } from './protocols/cache';

function createCacheWithClient(): [
  ProtoframePubsub<CacheProtocol>,
  ProtoframePubsub<CacheProtocol>,
] {
  const data: { [key: string]: string } = {};
  const cache = new ProtoframePubsub(cacheProtocol, window);
  cache.handleTell('set', ({ key, value }) => (data[key] = value));
  cache.handleTell('delete', ({ key }) => delete data[key]);
  cache.handleAsk('get', async ({ key }) => {
    const value = key in data ? data[key] : null;
    return { value };
  });
  return [cache, new ProtoframePubsub(cacheProtocol, window)];
}

describe('ProtoframeSubscriber', () => {
  describe('handleTell', () => {
    it('should receive a message over a window', async () => {
      const sub = new ProtoframeSubscriber(cacheProtocol);
      const p = new Promise<[string, string]>((accept) => {
        sub.handleTell('set', ({ key, value }) => accept([key, value]));
      });
      try {
        const pub = new ProtoframePublisher(cacheProtocol, window);
        pub.tell('set', { key: 'the key', value: 'the value' });
        const [actualKey, actualValue] = await p;
        expect(actualKey).toBe('the key');
        expect(actualValue).toBe('the value');
      } finally {
        sub.destroy();
      }
    });
  });
});

describe('ProtoframePubsub', () => {
  describe('ask', () => {
    it('should allow two way communication across a window', async () => {
      const [cache, client] = createCacheWithClient();
      try {
        // There should be no value
        expect((await client.ask('get', { key: 'key0' })).value).toBeNull;

        // Set a value
        client.tell('set', { key: 'key0', value: 'value' });

        // There should now be a value
        expect((await client.ask('get', { key: 'key0' })).value).toBe('value');

        // Delete the value
        client.tell('delete', { key: 'key0' });

        // There should no longer be a value
        expect((await client.ask('get', { key: 'key0' })).value).toBeNull;
      } finally {
        cache.destroy();
      }
    });
  });
});
