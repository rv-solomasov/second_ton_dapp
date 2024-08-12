import { useState } from 'react';
import { TonConnectButton } from '@tonconnect/ui-react';
import './App.css';
import DarkModeToggle from './DarkModeToggle';
import { useMainContract } from './hooks/useMainContract';
import { useTonConnect } from './hooks/useTonConnect';
import { fromNano } from '@ton/core';
import WebApp from '@twa-dev/sdk';

function App() {
  const {
    owner_address,
    // contract_address,
    counter_value,
    contract_balance,
    betOnHeads,
    betOnTails,
    sendDeposit,
    sendWithdrawalRequest
  } = useMainContract();

  const { connected, accountAddress } = useTonConnect();
  const isOwner = accountAddress === 'UQDtTs-hkx9THnUWYMKMmdCOudSS0t7LzhhOR7tzdZxPoI8h'; //TEMP FIX

  const [betAmount, setBetAmount] = useState("0.05");

  const showAlert = () => {
    WebApp.showAlert("Hey there!");
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <TonConnectButton />
        <DarkModeToggle />
        <button className="tutorial-button" onClick={showAlert}>
          Show Tutorial
        </button>
      </header>

      <main className="content">
        <div className="card">
          <h3>Owner Address</h3>
          <p className='hint'>{owner_address?.toString()}</p>
          <h3>Your Address</h3>
          <p className='hint'>{accountAddress?.toString()}</p>
          <h3>Our Contract Balance</h3>
          <p className='hint'>{contract_balance && fromNano(contract_balance)}</p>
        </div>

        <div className="card">
          <h3>Total Games Played</h3>
          <p>{counter_value ?? "Loading..."}</p>
        </div>

       <div className="bet-section">
        <label htmlFor="betAmount">Bet Amount (in TON): </label>
        <input
          id="betAmount"
          type="number"
          value={betAmount}
          onChange={(e) => setBetAmount(e.target.value)}
          onFocus={(e) => e.target.select()}  // This will select the entire input content when focused
          min="0.001"
          max="1.0"
          step="any" // Ensures there's no default step value
        />
      </div>

        {connected && isOwner && (
          <div className="actions">
            <button className="action-button" onClick={() => sendDeposit(betAmount)}>
              (Admin) Deposit
            </button>
            <button className="action-button" onClick={() => sendWithdrawalRequest(betAmount)}>
              (Admin) Withdraw
            </button>
          </div>
        )}

        {connected && !isOwner &&(
          <div className="actions">
            <button className="action-button" onClick={() => betOnHeads(betAmount)}>
              Bet on Heads
            </button>
            <button className="action-button" onClick={() => betOnTails(betAmount)}>
              Bet on Tails
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
