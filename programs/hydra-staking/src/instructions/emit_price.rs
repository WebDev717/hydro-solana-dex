use crate::constants::*;
use crate::events::*;
use crate::utils::price::calc_price;
use crate::ProgramResult;
use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, TokenAccount};

#[derive(Accounts)]
pub struct EmitPrice<'info> {
    #[account(
        address = HYDRA_TOKEN_MINT_PUBKEY.parse::<Pubkey>().unwrap(),
    )]
    pub token_mint: Account<'info, Mint>,

    #[account(
        mut,
        address = X_HYDRA_TOKEN_MINT_PUBKEY.parse::<Pubkey>().unwrap(),
    )]
    pub x_token_mint: Account<'info, Mint>,

    #[account(
        mut,
        seeds = [ token_mint.key().as_ref() ],
        bump,
    )]
    pub token_vault: Account<'info, TokenAccount>,
}

pub fn handle(ctx: Context<EmitPrice>) -> ProgramResult {
    let price = calc_price(&ctx.accounts.token_vault, &ctx.accounts.x_token_mint);
    emit!(Price {
        hyd_per_xhyd_1e9: price.0,
        hyd_per_xhyd: price.1,
    });
    Ok(())
}
