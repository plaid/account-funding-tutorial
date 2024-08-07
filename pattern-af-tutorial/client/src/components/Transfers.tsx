import React, { useState } from 'react';
import Callout from 'plaid-threads/Callout';
import { Button } from 'plaid-threads/Button';

import { AccountType, AppFundType } from './types';
import { currencyFilter } from '../util';
import { TransferForm } from '.';
import { updateAppFundsBalance, makeTransfer } from '../services/api';

const IS_PROCESSOR = process.env.REACT_APP_IS_PROCESSOR;

interface TransferResponse {
  newAccount: AccountType;
  newAppFunds: AppFundType;
}
interface Props {
  account: AccountType;
  userId: number;
  setAppFund: (appFund: AppFundType) => void;
  setShowTransfer: (arg: boolean) => void;
  institutionName: string | null;
  setAccount: (arg: AccountType) => void;
}

// This component checks to make sure the amount of transfer does not
// exceed the balance in the account and then initiates the ach transfer or processor request.
// Note that no transfers are actually made in this sample app; therefore balances in
// linked accounts will not actually be decremented when
// a transfer is made in this app.

const Transfers: React.FC<Props> = (props: Props) => {
  const [isAmountOkay, setIsAmountOkay] = useState(true);
  const [transferAmount, setTransferAmount] = useState(0);
  const [isTransferConfirmed, setIsTransferConfirmed] = useState(false);
  const [showInput, setShowInput] = useState(true);
  const account = props.account;
  const [
    showTransferConfirmationError,
    setShowTransferConfirmationError,
  ] = useState(false);

  // use available_balance only; leave it up to developer to decide
  // the risk of using current_balance:
  const balance = account.available_balance;

  const errorMessage = !isAmountOkay
    ? transferAmount <= 0
      ? `You must enter an amount greater than $0.00`
      : `We are unable to verify ${currencyFilter(
          transferAmount
        )} in your bank account.`
    : `Oops! Something went wrong with the transfer. Try again later.`;

  const sendRequestToProcessor = async (
    amount: number,
    funding_source_url: string,
    itemId: number
  ) => {
    // ADD CODE FOR CHECKPOINT 9 ON THIS LINE AND DELETE THE CONSOLE LOG BELOW
    console.log("Checkpoint #9: can't transfer to Dwolla yet"); // DELETE THIS LINE
  };

  const completeAchTransfer = (amount: number, accountId: string) => {
    // placeholder code to simulate ach bank transfer using bank routing and bank account data from the get auth call.
    // api route to complete ach bank transfer
    console.log(
      'completing transfer of' + amount + ' from account # ' + accountId
    );
    // return confirmation of ach transfer
    return amount;
  };

  const checkAmountAndInitiate = async (amount: number) => {
    // ADD CODE FOR CHECKPOINT 8 ON THIS LINE AND DELETE THE CONSOLE LOG BELOW
    console.log('Checkpoint #8: cannot check the amount yet'); // DELETE THIS LINE
  };

  return (
    <div className="transfers">
      {showInput && (
        <TransferForm
          setShowTransfer={props.setShowTransfer}
          checkAmountAndInitiate={checkAmountAndInitiate}
          setShowInput={setShowInput}
        />
      )}
      {isTransferConfirmed && (
        <>
          <div>
            <h3 className="subheading">Transfer Confirmed</h3>{' '}
          </div>
          <p>{`You have successfully transferred ${currencyFilter(
            transferAmount
          )} from ${props.institutionName} to your Plaid Pattern Account.`}</p>
          <Button
            small
            centered
            inline
            onClick={() => props.setShowTransfer(false)}
          >
            Done
          </Button>
        </>
      )}
      {(!isAmountOkay || showTransferConfirmationError) && (
        <>
          <div>
            <h3 className="subheading">Transfer Error</h3>{' '}
          </div>
          <Callout className="callout" warning>
            {' '}
            {errorMessage}
          </Callout>
          <Button
            small
            centered
            inline
            onClick={() => props.setShowTransfer(false)}
          >
            Back
          </Button>
        </>
      )}
    </div>
  );
};

Transfers.displayName = 'Transfers';
export default Transfers;
