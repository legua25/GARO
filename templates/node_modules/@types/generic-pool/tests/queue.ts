import { createPool } from '../index';

const pool = createPool(
  {
    create: function () {
      return Promise.resolve('test');
    },
    destroy: function (resource) {
    }
  },
  {
    max: 10,
    idleTimeoutMillis: 30000,
    priorityRange: 3
  }
);

pool.acquire().then(function (client) {
  pool.release(client);
});

pool.acquire(0).then(function (client) {
  pool.release(client);
});

pool.acquire(1).then(function (client) {
  pool.release(client);
});
