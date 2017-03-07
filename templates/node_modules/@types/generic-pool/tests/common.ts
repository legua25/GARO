import { createPool } from '../index';

const pool = createPool(
  {
    create () {
      return 'Hello World';
    },
    destroy (client) {

    }
  },
  {
    max: 10,
    min: 2,
    idleTimeoutMillis: 30000
  }
);

pool.acquire().then(function (client) {
  pool.release(client);
});

pool.drain().then(function () {
  pool.clear();
});
