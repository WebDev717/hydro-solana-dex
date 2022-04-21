import { Transaction, PublicKey } from "@solana/web3.js";
import { createCtxAnchor } from "../ctx";

export type Wallet = {
  signTransaction(tx: Transaction): Promise<Transaction>;
  signAllTransactions(txs: Transaction[]): Promise<Transaction[]>;
  publicKey: PublicKey;
};

export type ProgramIds = {
  // hydra staking program
  hydraBenchmarks: string;
  hydraFarming: string;
  hydraLiquidityPools: string;
  hydraStaking: string;
  redeemableMint: string;
  tokenMint: string;
};

export type Ctx = ReturnType<typeof createCtxAnchor>;

export type Network = "mainnet-beta" | "testnet" | "devnet" | "localnet";

export type NetworkConfig = {
  programIds: ProgramIds;
};

export type NetworkMap = Record<Network, NetworkConfig>;

export type Option<T> = T | undefined;
