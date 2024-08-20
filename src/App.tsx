import { useEffect, useState } from 'react';
import { TonConnectButton } from '@tonconnect/ui-react';
import './App.css';
import DarkModeToggle from './DarkModeToggle';
import { useMainContract } from './hooks/useMainContract';
import { fromNano } from '@ton/core';
import WebApp from '@twa-dev/sdk';
import Modal from './components/Modal';
import { useDebouncedEffect } from './hooks/useDebouncedEffect'; // Import the debounced effect hook

function App() {
    const {
        counter_value,
        contract_balance,
        isWinner,
        isOwner,
        connected,
        betOnHeads,
        betOnTails,
        sendDeposit,
        sendWithdrawalRequest
    } = useMainContract();

    const [betAmount, setBetAmount] = useState("0.05");
    const [gameState, setGameState] = useState(connected ? "waiting for bet" : "please connect your wallet");
    const [modalMessage, setModalMessage] = useState<string | null>(null);

    const showAlert = () => {
        WebApp.showAlert("Hey there!");
    };

    const isBetAmountValid = parseFloat(betAmount) >= 0.01 && parseFloat(betAmount) <= 10.0;

    useDebouncedEffect(() => {
        if (!connected) {
            setGameState("please connect your wallet");
            return;
        }

        if (isWinner === true) {
            setGameState("you won");
            setModalMessage("You won!");
        } else if (isWinner === false) {
            setGameState("you lost");
            setModalMessage("You lost!");
        } else if (isWinner === undefined) {
            setGameState(prevState => (prevState === "game in progress" ? prevState : "waiting for bet"));
        }

        // Handle transaction signing failure
        const handleTransactionSigningFailed = () => {
            setGameState('waiting for bet');
        };

        window.addEventListener('ton-connect-ui-transaction-signing-failed', handleTransactionSigningFailed);

        return () => {
            window.removeEventListener('ton-connect-ui-transaction-signing-failed', handleTransactionSigningFailed);
        };
    }, [isWinner, connected], 300);

    const handleCloseModal = () => {
        setModalMessage(null);
        setGameState("waiting for bet"); // Reset game state after closing the modal
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
                                    disabled={gameState === "game in progress"} // Disable button during game in progress
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
                                    disabled={gameState === "game in progress"} // Disable button during game in progress
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
                            disabled={gameState === "game in progress"} // Disable input during game in progress
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
                            disabled={!isBetAmountValid || gameState === "game in progress"} // Disable button during game in progress
                        >
                            (Admin) Deposit
                        </button>
                        <button
                            className="action-button"
                            onClick={() => sendWithdrawalRequest(betAmount)}
                            disabled={!isBetAmountValid || gameState === "game in progress"} // Disable button during game in progress
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
                            disabled={!isBetAmountValid || gameState === "game in progress"} // Disable button during game in progress
                        >
                            Bet on Heads
                        </button>
                        <button
                            className="action-button"
                            onClick={() => {
                                betOnTails(betAmount);
                                setGameState("game in progress");
                            }}
                            disabled={!isBetAmountValid || gameState === "game in progress"} // Disable button during game in progress
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
