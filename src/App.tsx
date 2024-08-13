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
    // owner_address,
    counter_value,
    contract_balance,
    betOnHeads,
    betOnTails,
    sendDeposit,
    sendWithdrawalRequest
  } = useMainContract();

  const { connected, accountAddress } = useTonConnect();
  const isOwner = accountAddress === 'UQDtTs-hkx9THnUWYMKMmdCOudSS0t7LzhhOR7tzdZxPoI8h'; // TEMP FIX

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
          <div className="info-item">
             <p><strong>Games Played:</strong> {counter_value ?? "Loading..."}</p>
          </div>
          <div className="info-item">
            <p><strong>Our Balance:</strong> {contract_balance ? fromNano(contract_balance) : "Loading..."}</p>
          </div>
        </div>

        {connected && (
            <div className="bet-section">
              <label htmlFor="betAmount" className="bet-label">Bet TON Amount: </label>
              <input
              id="betAmount"
              type="number"
              inputMode="decimal"
              value={betAmount}
              onChange={(e) => {
                const value = e.target.value;

                // Allow empty string or zero as a valid input
                if (value === "" || value === "0" || /^\d*\.?\d*$/.test(value)) {
                  const numericValue = parseFloat(value);

                  // Check if the value is empty, zero, or a valid number within the range
                  if (value === "" || value === "0" || (!isNaN(numericValue) && numericValue >= 0.001 && numericValue <= 1.0)) {
                    setBetAmount(value);
                  }
                }
              }}
              onFocus={(e) => e.target.select()}
              min="0.001"
              max="1.0"
              step="any"
            />
          </div>
        )}

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

        {connected && !isOwner && (
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
