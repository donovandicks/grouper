import { createClient, type RedisClientOptions, type RedisClientType } from "redis";

export class Cache {
  private client: RedisClientType;
  private options: RedisClientOptions;
  private conn: RedisClientType | undefined;

  constructor(options: RedisClientOptions, client?: RedisClientType) {
    this.client = client ?? (createClient(options) as RedisClientType);
    this.options = options;
    this.conn = undefined;
  }

  private async acquire(): Promise<RedisClientType> {
    if (this.conn === undefined) {
      this.conn = await this.client.connect();
    }

    return this.conn;
  }

  // @ts-expect-error WIP TODO: determine if this level of connection management is required
  private async release(): Promise<void> {
    if (this.conn !== undefined) {
      await this.conn.disconnect();
    }
  }

  clone(): Cache {
    return new Cache(this.options, this.client.duplicate() as RedisClientType);
  }

  async subscribe(
    channel: string,
    listener: (message: string, channel: string) => void,
  ): Promise<void> {
    await (await this.acquire()).subscribe(channel, listener);
  }

  async publish(channel: string, message: string): Promise<void> {
    await (await this.acquire()).publish(channel, message);
  }
}
