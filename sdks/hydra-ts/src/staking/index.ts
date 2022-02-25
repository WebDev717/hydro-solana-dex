import { Ctx } from "../types";
import * as wasm from "hydra-math-rs";
import { loadWasm } from "wasm-loader-ts";
import { TOKEN_PROGRAM_ID } from "@project-serum/serum/lib/token-instructions";
import NodeWallet from "@project-serum/anchor/dist/cjs/nodewallet";
import { web3 } from "@project-serum/anchor";
import { SystemProgram } from "@solana/web3.js";
import {
  fromBigInt,
  getExistingOwnerTokenAccount,
  getPDA,
} from "../utils/utils";
import { POOL_STATE_SEED, TOKEN_VAULT_SEED } from "../config/constants";

const hydraMath = loadWasm(wasm);

export function calculatePoolTokensForDeposit(_: Ctx) {
  return async (
    amount: BigInt,
    totalTokenVault: BigInt,
    totalRedeemableTokens: BigInt
  ) => {
    return await hydraMath.calculate_pool_tokens_for_deposit(
      amount,
      totalTokenVault,
      totalRedeemableTokens
    );
  };
}

export function calculatePoolTokensForWithdraw(_: Ctx) {
  return async (
    amount: BigInt,
    totalTokens: BigInt,
    totalRedeemableTokens: BigInt
  ) => {
    return await hydraMath.calculate_pool_tokens_for_withdraw(
      amount,
      totalTokens,
      totalRedeemableTokens
    );
  };
}

export function initialize(ctx: Ctx) {
  return async (tokenVaultBump: number, poolStateBump: number) => {
    const redeemableMint = ctx.getKey("redeemableMint");
    const tokenMint = ctx.getKey("tokenMint");
    const tokenVault = await getTokenVaultAccount(ctx);
    const poolState = await getPoolStateAccount(ctx);
    const program = ctx.programs.hydraStaking;

    await program.rpc.initialize(tokenVaultBump, poolStateBump, {
      accounts: {
        authority: program.provider.wallet.publicKey,
        tokenMint,
        redeemableMint,
        poolState,
        tokenVault,
        payer: program.provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        rent: web3.SYSVAR_RENT_PUBKEY,
      },
      signers: [
        (program.provider.wallet as NodeWallet).payer ||
          program.provider.wallet,
      ],
    });
  };
}

export function stake(ctx: Ctx) {
  return async (amount: BigInt) => {
    const redeemableMint = ctx.getKey("redeemableMint");
    const tokenMint = ctx.getKey("tokenMint");
    const tokenVault = await getTokenVaultAccount(ctx);
    const poolState = await getPoolStateAccount(ctx);

    const userFromAuthority = ctx.wallet.publicKey;

    const tokenProgram = TOKEN_PROGRAM_ID;

    const userFrom = await getExistingOwnerTokenAccount(
      ctx.provider,
      tokenMint
    );
    if (!userFrom) {
      throw new Error(
        `Token owner account for tokenMint ${tokenMint} does not exist.`
      );
    }

    const redeemableTo = await getExistingOwnerTokenAccount(
      ctx.provider,
      redeemableMint
    );

    if (!redeemableTo) {
      throw new Error(
        `Token owner account for redeemableMint ${redeemableMint} does not exist.`
      );
    }

    await ctx.programs.hydraStaking.rpc.stake(fromBigInt(amount), {
      accounts: {
        poolState,
        tokenMint,
        redeemableMint,
        userFrom,
        userFromAuthority,
        tokenVault,
        redeemableTo,
        tokenProgram,
      },
    });
  };
}
export function unstake(ctx: Ctx) {
  return async (amount: BigInt) => {
    const redeemableMint = ctx.getKey("redeemableMint");
    const tokenMint = ctx.getKey("tokenMint");
    const tokenVault = await getTokenVaultAccount(ctx);
    const poolState = await getPoolStateAccount(ctx);

    const redeemableFromAuthority = ctx.wallet.publicKey;

    const userTo = await getExistingOwnerTokenAccount(ctx.provider, tokenMint);
    if (!userTo) {
      throw new Error(
        `Token owner account for tokenMint ${tokenMint} does not exist.`
      );
    }

    const redeemableFrom = await getExistingOwnerTokenAccount(
      ctx.provider,
      redeemableMint
    );
    if (!redeemableFrom) {
      throw new Error(
        `Token owner account for redeemableMint ${redeemableMint} does not exist.`
      );
    }

    await ctx.programs.hydraStaking.rpc.unstake(fromBigInt(amount), {
      accounts: {
        poolState,
        tokenMint,
        redeemableMint,
        userTo,
        tokenVault,
        redeemableFrom,
        redeemableFromAuthority,
        tokenProgram: TOKEN_PROGRAM_ID,
      },
    });
  };
}

async function getTokenVaultAccount(ctx: Ctx) {
  return (
    await getPDA(ctx.programs.hydraStaking.programId, [
      TOKEN_VAULT_SEED,
      ctx.getKey("tokenMint"),
      ctx.getKey("redeemableMint"),
    ])
  )[0];
}

async function getPoolStateAccount(ctx: Ctx) {
  return (
    await getPDA(ctx.programs.hydraStaking.programId, [
      POOL_STATE_SEED,
      ctx.getKey("tokenMint"),
      ctx.getKey("redeemableMint"),
    ])
  )[0];
}
