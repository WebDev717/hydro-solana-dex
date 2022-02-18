import { Ctx } from "../types";
import * as wasm from "hydra-math-rs";
import { loadWasm } from "../utils/wasm-loader";

const hydraMath = loadWasm(wasm);

export const calculatePoolTokensForDeposit =
  () =>
  async (
    amount: BigInt,
    totalTokenVault: BigInt,
    totalRedeemableTokens: BigInt
  ) => {
    return await hydraMath.calc_pool_tokens_for_deposit(
      amount,
      totalTokenVault,
      totalRedeemableTokens
    );
  };

export const stake = (ctx: Ctx) => async () => {};
export const unstake = (ctx: Ctx) => async () => {};
