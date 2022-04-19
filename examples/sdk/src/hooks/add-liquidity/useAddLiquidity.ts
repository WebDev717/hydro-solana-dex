import { useHydraClient } from "../../components/HydraClientProvider";
import { usePoolStream } from "../usePoolStream";
import { useTokenForm } from "../useTokenForm";
import { useAddLiquidityUIState } from "./useAddLiquidityUIState";
import { useCreateAddLiquidityCommands } from "./useCreateAddLiquidtyCommands";

export function useAddLiquidity(
  slippage: bigint,
  tokenAInit?: string,
  tokenBInit?: string
) {
  // get form data and controls
  const sdk = useHydraClient();
  const { assetsTokenA, assetsTokenB, focus, setFocus, tokenA, tokenB } =
    useTokenForm({ tokenAInit, tokenBInit });

  // get pool values
  const pool = usePoolStream(sdk, tokenA.mint, tokenB.mint);
  const { isInitialized } = pool;

  // get modal state and handlers
  const commands = useCreateAddLiquidityCommands(
    sdk,
    tokenA,
    tokenB,
    slippage,
    isInitialized
  );
  const { onSendSubmit, onSendCancel, state } =
    useAddLiquidityUIState(commands);

  const isSubmitDisabled = !(
    tokenA.asset &&
    tokenB.asset &&
    tokenA.amount > 0n &&
    tokenB.amount > 0n
  );

  return {
    ...pool,
    assetsTokenA,
    assetsTokenB,
    focus,
    isSubmitDisabled,
    onSendCancel,
    onSendSubmit,
    setFocus,
    state,
    tokenA,
    tokenB,
  };
}
