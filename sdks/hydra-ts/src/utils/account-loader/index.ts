import { AccountInfo, Commitment, PublicKey } from "@solana/web3.js";
import { Ctx } from "../../types";
import { findAssociatedTokenAddress } from "..";
import * as TokenAccount from "../../types/token-account";
import * as TokenMint from "../../types/token-mint";
import { Observable } from "rxjs";
import { withBump, withBalance } from "./utils";
import { Getter, Parser, IAccountLoader } from "./types";

export * from "./types";
type KeyOrGetter = Getter<PublicKey> | PublicKey;
export function AccountLoader<T>(
  ctx: Ctx,
  getter: KeyOrGetter,
  accountParser: Parser<T>
): IAccountLoader<T> {
  const getKey =
    typeof getter === "function" ? getter : () => Promise.resolve(getter);

  async function info(commitment?: Commitment) {
    const key = await getKey();
    console.log("fetching info for... " + key.toString());
    let info = await ctx.connection.getAccountInfo(key, commitment);
    if (info === null) {
      throw new Error("info couldnt be fetched");
    }

    return { ...info, data: accountParser(info) };
  }
  async function key() {
    return await getKey();
  }
  return {
    key,
    info,

    onChange(callback, commitment) {
      let id: number;

      // Hold connection in the closure
      const { connection } = ctx;

      getKey().then((key) => {
        if (!key) return;
        id = connection.onAccountChange(
          key,
          (info) => {
            callback(accountParser(info));
          },
          commitment
        );
      });

      return () => {
        getKey().then(() => {
          if (typeof id !== "undefined")
            connection.removeAccountChangeListener(id);
        });
      };
    },
    stream(commitment?: Commitment) {
      return new Observable((subscriber) => {
        let fetchingInfo = true;
        info(commitment)
          .then(async (account) => {
            if (account) {
              const pubkey = await key();

              if (!fetchingInfo) return;
              subscriber.next({
                account,
                pubkey,
              });
            }
          })
          .catch((err) => {
            // subscriber.error(err);
          });
        let id: number;

        key().then((pubkey) => {
          id = ctx.connection.onAccountChange(
            pubkey,
            async (rawAccount: AccountInfo<Buffer> | null) => {
              if (!!rawAccount) {
                fetchingInfo = false;
                const account = {
                  ...rawAccount,
                  data: accountParser(rawAccount),
                };
                subscriber.next({ pubkey: await key(), account });
              }
            }
          );
        });

        return () => {
          key().then(() => {
            ctx.connection.removeAccountChangeListener(id);
          });
        };
      });
    },
    parser() {
      return accountParser;
    },
    ctx() {
      return ctx;
    },
  };
}

export function PDAToken(
  ctx: Ctx,
  programId: PublicKey,
  seeds: (PublicKey | string)[]
) {
  return withBalance(PDA(ctx, programId, seeds, TokenAccount.Parser));
}

export function Token(ctx: Ctx, getter: KeyOrGetter) {
  return withBalance(AccountLoader(ctx, getter, TokenAccount.Parser));
}

export function Mint(ctx: Ctx, getter: KeyOrGetter) {
  return AccountLoader(ctx, getter, TokenMint.Parser);
}

export function PDAMint(
  ctx: Ctx,
  programId: PublicKey,
  seeds: (PublicKey | string)[]
) {
  return PDA(ctx, programId, seeds, TokenMint.Parser);
}

export function AssociatedToken(ctx: Ctx, mint: PublicKey) {
  return Token(ctx, () =>
    findAssociatedTokenAddress(ctx.wallet.publicKey, mint)
  );
}

export function PDA<T>(
  ctx: Ctx,
  programId: PublicKey,
  seeds: (PublicKey | string)[],
  parser: Parser<T>
) {
  return withBump(
    () => ctx.utils.getPDA(programId, seeds),
    (keyGetter) => AccountLoader<T>(ctx, keyGetter, parser)
  );
}
