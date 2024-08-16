import { useState, useEffect } from 'react';
import { TonConnectButton } from '@tonconnect/ui-react';
import './App.css';
import DarkModeToggle from './DarkModeToggle';
import { useMainContract } from './hooks/useMainContract';
import { useTonConnect } from './hooks/useTonConnect';
import { fromNano } from '@ton/core';
import WebApp from '@twa-dev/sdk';
import Modal from './components/Modal'; // Import the Modal component

function App() {
  const {
    counter_value,
    contract_balance,
    isWinner,
    isOwner,
    betOnHeads,
    betOnTails,
    sendDeposit,
    sendWithdrawalRequest
  } = useMainContract();

  const { connected } = useTonConnect();

  const [betAmount, setBetAmount] = useState("0.05");
  const [gameState, setGameState] = useState("waiting for bet");
  const [modalMessage, setModalMessage] = useState<string | null>(null);

  const showAlert = () => {
    WebApp.showAlert("Hey there!");
  };

  const isBetAmountValid = parseFloat(betAmount) >= 0.01 && parseFloat(betAmount) <= 10.0;

  useEffect(() => {

    if (isWinner === true) {
      setGameState("you won");
      setModalMessage("You won!");
    } else if (isWinner === false) {
      setGameState("you lost");
      setModalMessage("You lost!");
    } else if (isWinner === undefined) {
      setGameState(prevState => (prevState === "game in progress" ? prevState : "waiting for bet"));
    }
  }, [isWinner]);

  const handleCloseModal = () => {
    setModalMessage(null);
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

        <div className="game-state">
          <p>{gameState}</p>
        </div>

        {connected && (
            <div className="bet-section">
              <div className="bet-amount-buttons">
                {[0.5, 1, 2].map(amount => (
                    <button
                        key={amount}
                        type="button"
                        className="bet-amount-button"
                        onClick={() => setBetAmount(amount.toString())}
                    >
                      {amount} TON
                    </button>
                ))}
              </div>
              <div className="bet-amount-buttons">
                {[5, 7, 10].map(amount => (
                    <button
                        key={amount}
                        type="button"
                        className="bet-amount-button"
                        onClick={() => setBetAmount(amount.toString())}
                    >
                      {amount} TON
                    </button>
                ))}
              </div>

              <label htmlFor="betAmount" className="bet-label">Bet TON Amount: </label>
              <input
                  id="betAmount"
                  type="number"
                  inputMode="decimal"
                  value={betAmount}
                  onChange={(e) => {
                    const value = e.target.value;

                    if (value === "" || /^\d*\.?\d*$/.test(value)) {
                      if (value === "" || value === "0" || value === "0." || (!isNaN(parseFloat(value)) && parseFloat(value) >= 0 && parseFloat(value) <= 10.0)) {
                        setBetAmount(value);
                      }
                    }
                  }}
                  onFocus={(e) => e.target.select()}
                  min="0.01"
                  max="10.0"
                  step="any"
                  className={`bet-input ${!isBetAmountValid ? "invalid" : ""}`}
              />
              {!isBetAmountValid &&
                  <p className="error-message">Please enter a valid amount between 0.01 and 10 TON.</p>}
            </div>
        )}

        {connected && isOwner && (
            <div className="actions">
              <button
                  className="action-button"
                  onClick={() => sendDeposit(betAmount)}
                  disabled={!isBetAmountValid}
              >
                (Admin) Deposit
              </button>
              <button
                  className="action-button"
                  onClick={() => sendWithdrawalRequest(betAmount)}
              disabled={!isBetAmountValid}
            >
              (Admin) Withdraw
            </button>
          </div>
        )}

        {connected && (
          <div className="actions">
            <button
              className="action-button"
              onClick={() => {
                betOnHeads(betAmount);
                setGameState("game in progress");
              }}
              disabled={!isBetAmountValid}
            >
              Bet on Heads
            </button>
            <button
              className="action-button"
              onClick={() => {
                betOnTails(betAmount);
                setGameState("game in progress");
              }}
              disabled={!isBetAmountValid}
            >
              Bet on Tails
            </button>
          </div>
        )}

        {modalMessage && (
          <Modal message={modalMessage} onClose={handleCloseModal} />
        )}
      </main>
    </div>
  );
}

export default App;
