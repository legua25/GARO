import { createPool } from '../index';

const pool = createPool({
  create: () => 'test',
  destroy: () => undefined
});

pool.size;
pool.available;
pool.pending;
pool.min;
pool.max;
