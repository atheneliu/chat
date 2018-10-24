import knex from 'knex'
import { config } from './config'

export const xsldrDb = knex({
  client: 'mysql',
  connection: config.xsldrDb,
  pool: {
    min: 5,
    max: 100,
  },
})

export const xslMada = knex({
  client: 'mysql',
  connection: config.xslMada,
  pool: {
    min: 5,
    max: 100,
  },
})
