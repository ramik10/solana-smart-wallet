use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint,
    entrypoint::ProgramResult,
    msg,
    program::invoke_signed,
    program_error::ProgramError,
    pubkey::Pubkey,
    system_instruction,
    sysvar::{rent::Rent, Sysvar},
};

entrypoint!(process_instruction);

pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    let amount = instruction_data
        .get(..8)
        .and_then(|slice| slice.try_into().ok())
        .map(u64::from_le_bytes)
        .ok_or(ProgramError::InvalidInstructionData)?;

    process_transfer_from_pda(program_id, accounts, amount)
}

pub fn process_transfer_from_pda(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    amount: u64,
) -> ProgramResult {
    let accounts_iter = &mut accounts.iter();

    let wallet_signer = next_account_info(accounts_iter)?;
    let pda_account = next_account_info(accounts_iter)?;
    let destination_account = next_account_info(accounts_iter)?;
    let system_program = next_account_info(accounts_iter)?;

    let (expected_pda, bump_seed) = Pubkey::find_program_address(
        &[wallet_signer.key.to_bytes().as_ref()],
        program_id,
    );

    if expected_pda != *pda_account.key {
        return Err(ProgramError::InvalidAccountData);
    }

    if !wallet_signer.is_signer {
        return Err(ProgramError::MissingRequiredSignature);
    }

    msg!("Transferring {} lamports from PDA to {:?}", amount, destination_account.key);

    let transfer_instruction = system_instruction::transfer(
        pda_account.key,
        destination_account.key,
        amount,
    );


    invoke_signed(
        &transfer_instruction,
        &[pda_account.clone(), destination_account.clone(), system_program.clone()], 
        &[&[
            wallet_signer.key.to_bytes().as_ref(),
            &[bump_seed],
        ]], 
    )?;

    Ok(())
}



