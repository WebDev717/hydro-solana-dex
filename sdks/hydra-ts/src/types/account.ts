import { Commitment } from "@solana/web3.js";
import { AccountInfo } from "@solana/web3.js";
import { PublicKey } from "@solana/web3.js";
import { Option, Ctx } from ".";

export class OptionalAccount {}
export class Account {
  constructor(
    private _key: PublicKey | Promise<PublicKey | undefined> | undefined,
    private ctx: Ctx
  ) {}
  async key(optional?: true): Promise<PublicKey>;
  async key(optional: true): Promise<Option<PublicKey>> {
    const key = await Promise.resolve(this._key);
    if (optional === true) {
      return key;
    }
    if (key === undefined) throw new Error("Key was undefined after await");
    return key;
  }
  async info(commitment?: Commitment) {
    const key = await this.key();
    return await this.ctx.connection.getAccountInfo(key, commitment);
  }

  async bal(commitment?: Commitment) {
    const key = await this.key();
    const balance = await this.ctx.connection.getTokenAccountBalance(
      key,
      commitment
    );
    balance.value;
    return BigInt(balance.value.amount);
  }

  onChange(
    callback: (info: AccountInfo<Buffer>) => void,
    commitment?: Commitment
  ) {
    const { connection } = this.ctx;
    let id: number;
    const resolvedKey = Promise.resolve(this.key());
    resolvedKey.then((key) => {
      if (!key) return;
      id = connection.onAccountChange(key, callback, commitment);
    });
    return () => {
      resolvedKey.then(() => {
        if (typeof id !== "undefined")
          connection.removeAccountChangeListener(id);
      });
    };
  }
}
