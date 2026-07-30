import knex from 'knex';
import config from '../../knexfile';

const db = knex(config as any);

export default db;
