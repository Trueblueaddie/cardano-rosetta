/* eslint-disable no-magic-numbers */
/* eslint-disable camelcase */
import StatusCodes from 'http-status-codes';
import { Pool } from 'pg';
import { FastifyInstance } from 'fastify';
import { setupDatabase, setupServer, testInvalidNetworkParameters } from '../utils/test-utils';

const CONSTRUCTION_METADATA_ENDPOINT = '/construction/metadata';

const generateMetadataPayload = (blockchain: string, network: string, relativeTtl: number) => ({
  network_identifier: {
    blockchain,
    network
  },
  options: {
    relative_ttl: relativeTtl
  }
});

describe(CONSTRUCTION_METADATA_ENDPOINT, () => {
  let database: Pool;
  let server: FastifyInstance;

  beforeAll(async () => {
    database = setupDatabase(true);
    server = setupServer(database);
  });

  afterAll(async () => {
    await database.end();
  });

  beforeAll(async () => {
    database = setupDatabase(false);
    server = setupServer(database);
  });

  test('Should return a valid TTL when the parameters are valid', async () => {
    const response = await server.inject({
      method: 'post',
      url: CONSTRUCTION_METADATA_ENDPOINT,
      payload: generateMetadataPayload('cardano', 'mainnet', 100)
    });
    expect(response.statusCode).toEqual(StatusCodes.OK);
    expect(response.json()).toEqual({ metadata: { ttl: '65294' } });
  });

  testInvalidNetworkParameters(
    CONSTRUCTION_METADATA_ENDPOINT,
    (blockchain, network) => generateMetadataPayload(blockchain, network, 100),
    () => server
  );
});