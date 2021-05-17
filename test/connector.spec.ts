import {
  ProtoframeSubscriber,
  ProtoframePublisher,
  ProtoframePubsub,
} from '../src';
import { cacheProtocol, CacheProtocol } from './protocols/cache';
import { helloWorldProtocol } from './protocols/helloWorld';
import { pause } from './util';

function createCacheWithClient({
  cache = new ProtoframePubsub(cacheProtocol, window),
  client = new ProtoframePubsub(cacheProtocol, window),
}: {
  cache?: ProtoframePubsub<CacheProtocol>;
  client?: ProtoframePubsub<CacheProtocol>;
} = {}): [
  ProtoframePubsub<CacheProtocol>,
  ProtoframePubsub<CacheProtocol>,
  { [key: string]: string },
] {
  const data: { [key: string]: string } = {};
  cache.handleTell('set', ({ key, value }) => (data[key] = value));
  cache.handleTell('delete', ({ key }) => delete data[key]);
  cache.handleAsk('get', async ({ key }) => {
    const value = key in data ? data[key] : null;
    return { value };
  });
  return [cache, client, data];
}

async function testFullyFunctionalConcurrentCache(
  client: ProtoframePubsub<CacheProtocol>,
): Promise<void> {
  // There should be no value
  expect((await client.ask('get', { key: 'key0' })).value).toBeNull;

  // Set a couple values
  client.tell('set', { key: 'key0', value: 'value0' });
  client.tell('set', { key: 'key1', value: 'value1' });

  // Get the two values concurrently
  expect(
    await Promise.all([
      client.ask('get', { key: 'key0' }),
      client.ask('get', { key: 'key1' }),
    ]).then((rs) => rs.map((r) => r.value)),
  ).toEqual(['value0', 'value1']);

  // Delete the value
  client.tell('delete', { key: 'key0' });

  // There should no longer be a value
  expect((await client.ask('get', { key: 'key0' })).value).toBeNull();
}

describe('ProtoframePublisher', () => {
  describe('parent', () => {
    it('should fail if the iframe does not have a contentWindow', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const iframe: any = {
        contentWindow: null,
      };
      expect(() =>
        ProtoframePublisher.parent(cacheProtocol, iframe, '*'),
      ).toThrowError('iframe.contentWindow was null');
    });

    it('should return a connector connected to an iframe contentWindow', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const iframe: any = {
        contentWindow: window,
      };
      const client = ProtoframePublisher.parent(cacheProtocol, iframe);
      const cache = new ProtoframeSubscriber(cacheProtocol, window);

      try {
        const p = new Promise((accept) => cache.handleTell('set', accept));
        client.tell('set', { key: 'the', value: 'password' });
        expect(await p).toEqual({ key: 'the', value: 'password' });
      } finally {
        client.destroy();
        cache.destroy();
      }
    });
  });

  describe('iframe', () => {
    it('should return a connector connected to the window parent', async () => {
      // Use `window` in place of the default argument of window.parent.
      // Ideally I could spy on window.parent and just ensure it was used by
      // default but that functionality is not available in jasmine's spyOn /
      // spyOnProperty capabilities
      const client = ProtoframePublisher.iframe(cacheProtocol, '*', window);
      const cache = new ProtoframeSubscriber(cacheProtocol, window);
      try {
        const p = new Promise((accept) => cache.handleTell('set', accept));
        client.tell('set', { key: 'the', value: 'password' });
        expect(await p).toEqual({ key: 'the', value: 'password' });
      } finally {
        client.destroy();
        cache.destroy();
      }
    });
  });
});

describe('ProtoframeSubscriber', () => {
  describe('handleTell', () => {
    it('should receive a message over a window', async () => {
      const pub = new ProtoframePublisher(cacheProtocol, window);
      const sub = new ProtoframeSubscriber(cacheProtocol);
      const p = new Promise<[string, string]>((accept) => {
        sub.handleTell('set', ({ key, value }) => accept([key, value]));
      });
      try {
        pub.tell('set', { key: 'the key', value: 'the value' });
        const [actualKey, actualValue] = await p;
        expect(actualKey).toBe('the key');
        expect(actualValue).toBe('the value');
      } finally {
        pub.destroy();
        sub.destroy();
      }
    });
  });
});

describe('ProtoframePubsub', () => {
  describe('connect', () => {
    it('should fail if we cannot connect within the allocated time', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const iframe: any = {
        contentWindow: {
          // This iframe window we will post messages on is not linked to the
          // one we are listening to. So any `ask` messages will be dropped
          postMessage: (): void => undefined,
        },
      };
      spyOn(iframe.contentWindow, 'postMessage');

      const pubsub = ProtoframePubsub.parent(cacheProtocol, iframe);
      try {
        await expectAsync(
          ProtoframePubsub.connect(pubsub, 5, 10),
        ).toBeRejectedWithError(
          'Could not connect on protocol cache after 50ms',
        );

        // Ensure it attempted to connect 6 times (once initially, then 5
        // retries)
        expect(iframe.contentWindow.postMessage).toHaveBeenCalledTimes(6);
      } finally {
        pubsub.destroy();
      }
    });
    it('should connect if there is a connector on both ends', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const iframe: any = {
        contentWindow: window,
      };
      const pubsub = ProtoframePubsub.parent(cacheProtocol, iframe);
      try {
        const connectedPubsub = await ProtoframePubsub.connect(pubsub, 5, 10);
        expect(pubsub).toBe(connectedPubsub);
      } finally {
        pubsub.destroy();
      }
    });
  });
  describe('parent', () => {
    it('should fail if the child iframe has no contentWindow', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const iframe: any = {
        contentWindow: null,
      };
      expect(() => ProtoframePubsub.parent(cacheProtocol, iframe)).toThrowError(
        'iframe.contentWindow was null',
      );
    });

    it('should establish 2-way communication with an iframe', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const iframe: any = {
        contentWindow: window,
      };
      const client = ProtoframePubsub.parent(cacheProtocol, iframe);
      const [cache] = createCacheWithClient({ client });
      try {
        await testFullyFunctionalConcurrentCache(client);
      } finally {
        client.destroy();
        cache.destroy();
      }
    });
  });

  describe('iframe', () => {
    it('should establish 2-way communication with a parent frame', async () => {
      const cache = ProtoframePubsub.iframe(cacheProtocol, '*', {
        targetWindow: window,
      });
      const [, client] = createCacheWithClient({ cache });
      try {
        await testFullyFunctionalConcurrentCache(client);
      } finally {
        cache.destroy();
        client.destroy();
      }
    });
  });

  describe('ask', () => {
    it('should allow two way communication across a window', async () => {
      const [cache, client] = createCacheWithClient();
      try {
        await testFullyFunctionalConcurrentCache(client);
      } finally {
        cache.destroy();
        client.destroy();
      }
    });

    it('should quickly timeout if specified to do so', async () => {
      const pubsub = new ProtoframePubsub(cacheProtocol, window);
      try {
        // Send an ask with a low timeout. There are no listeners so this should
        // fail quickly
        await expectAsync(
          pubsub.ask('get', { key: 'something' }, 1),
        ).toBeRejectedWithError('Failed to get response within 1ms');
      } finally {
        pubsub.destroy();
      }
    });
  });

  describe('handleAsk', () => {
    it('should not be triggered by other types of messages', async () => {
      const cache = new ProtoframePubsub(cacheProtocol, window);
      const helloWorld = new ProtoframePubsub(helloWorldProtocol, window);
      try {
        const gets: { [key: string]: string }[] = [];

        cache.handleAsk('get', (b) => {
          gets.push(b);
          return Promise.resolve({ value: null });
        });

        // One entry that should be answered
        expect(await cache.ask('get', { key: 'something' })).toEqual({
          value: null,
        });

        // A different protocol with a similary-typed message should not trigger
        await expectAsync(
          helloWorld.ask('get', { name: 'ok' }, 1),
        ).toBeRejectedWithError('Failed to get response within 1ms');

        // A completely rogue message
        window.postMessage(undefined, '*');

        await pause(100);

        expect(gets).toEqual([{ key: 'something' }]);
      } finally {
        cache.destroy();
        helloWorld.destroy();
      }
    });
  });
});
