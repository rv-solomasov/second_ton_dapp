import { useState, useEffect } from 'react';
import { TonConnectButton } from '@tonconnect/ui-react';
import './App.css';
import DarkModeToggle from './DarkModeToggle';
import { useMainContract } from './hooks/useMainContract';
import { useTonConnect } from './hooks/useTonConnect';
import { fromNano } from '@ton/core';
import WebApp from '@twa-dev/sdk';

function App() {
  const {
    counter_value,
    contract_balance,
    isWinner, // Destructure isWinner from useMainContract
    betOnHeads,
    betOnTails,
    sendDeposit,
    sendWithdrawalRequest
  } = useMainContract();

  const { connected, accountAddress } = useTonConnect();
  const isOwner = accountAddress === 'UQDtTs-hkx9THnUWYMKMmdCOudSS0t7LzhhOR7tzdZxPoI8h'; // TEMP FIX

  const [betAmount, setBetAmount] = useState("0.05");
  const [gameState, setGameState] = useState("waiting for bet"); // Track the current game state

  const showAlert = () => {
    WebApp.showAlert("Hey there!");
  };

  // Check if the bet amount is valid
  const isBetAmountValid = parseFloat(betAmount) >= 0.001 && parseFloat(betAmount) <= 1;

  // Update gameState based on isWinner
  useEffect(() => {
    if (isWinner === true) {
      setGameState("you won");
    } else if (isWinner === false) {
      setGameState("you lost");
    } else if (isWinner === undefined) {
      // Keep "game in progress" if a bet has been placed, otherwise reset to "waiting for bet"
      setGameState(prevState => (prevState === "game in progress" ? prevState : "waiting for bet"));
    }
  }, [isWinner]);

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

        <div className="game-state">
          <p>{gameState}</p>
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

                // Allow empty string or values that match the pattern for numbers and decimals
                if (value === "" || /^\d*\.?\d*$/.test(value)) {
                  // Allow any numeric value, even 0 or 0.x as intermediate states
                  if (value === "" || value === "0" || value === "0." || (!isNaN(parseFloat(value)) && parseFloat(value) >= 0 && parseFloat(value) <= 1.0)) {
                    setBetAmount(value);
                  }
                }
              }}
              onFocus={(e) => e.target.select()}
              min="0.001"
              max="1.0"
              step="any"
              className={`bet-input ${!isBetAmountValid ? "invalid" : ""}`} // Conditionally add "invalid" class
            />
            {!isBetAmountValid && <p className="error-message">Please enter a valid amount between 0.001 and 1 TON.</p>}
          </div>
        )}

        {connected && isOwner && (
          <div className="actions">
            <button
              className="action-button"
              onClick={() => sendDeposit(betAmount)}
              disabled={!isBetAmountValid} // Disable if bet amount is not valid
            >
              (Admin) Deposit
            </button>
            <button
              className="action-button"
              onClick={() => sendWithdrawalRequest(betAmount)}
              disabled={!isBetAmountValid} // Disable if bet amount is not valid
            >
              (Admin) Withdraw
            </button>
          </div>
        )}

        {connected && !isOwner && (
          <div className="actions">
            <button
              className="action-button"
              onClick={() => {
                betOnHeads(betAmount);
                setGameState("game in progress"); // Set game state to "game in progress" after bet
              }}
              disabled={!isBetAmountValid} // Disable if bet amount is not valid
            >
              Bet on Heads
            </button>
            <button
              className="action-button"
              onClick={() => {
                betOnTails(betAmount);
                setGameState("game in progress"); // Set game state to "game in progress" after bet
              }}
              disabled={!isBetAmountValid} // Disable if bet amount is not valid
            >
              Bet on Tails
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
