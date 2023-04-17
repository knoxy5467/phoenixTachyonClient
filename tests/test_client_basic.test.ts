import { TachyonClient } from '../src/TachyonCLient';
import { describe, test, expect , beforeEach, afterEach,it} from '@jest/globals';


describe('TachyonClient', () => {
  let client: TachyonClient;


  beforeEach(() => {
    client = new TachyonClient('https://server3.beyondallreason.info', process.env.user_email!, process.env.user_password!);
  });

  afterEach(() => {
    client.disconnect();
  });

  it('should connect to the server', async () => {
    const isConnected = await client.isConnected();
    expect(isConnected).toBe(true);
  });

});