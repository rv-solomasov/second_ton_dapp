import { useState } from 'react';
import { TonConnectButton } from '@tonconnect/ui-react';
import './App.css';
import DarkModeToggle from './DarkModeToggle';
import { useMainContract } from './hooks/useMainContract';
import { fromNano } from '@ton/core';
import WebApp from '@twa-dev/sdk';
import Modal from './components/Modal';
import { useDebouncedEffect } from './hooks/useDebouncedEffect';
import Countdown from './components/Countdown'; // Import Countdown component
import CoinFlip from './components/Coinflip'; // Import CoinFlip component

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
    const [userBet, setUserBet] = useState<'heads' | 'tails' | null>(null); // Store user's bet choice
    const [flipResult, setFlipResult] = useState<'heads' | 'tails' | null>(null); // State for coin result
    const [isAnimating, setIsAnimating] = useState(false); // Control animation state
    const [showCountdown, setShowCountdown] = useState(false); // State to show countdown

    const showAlert = () => {
        WebApp.showAlert("Hey there!");
    };

    const isBetAmountValid = parseFloat(betAmount) >= 0.01 && parseFloat(betAmount) <= 10.0;

    // Effect to handle game state changes and animations based on bet and outcome
    useDebouncedEffect(() => {
        if (!connected) {
            setGameState("please connect your wallet");
            return;
        }

        if (isWinner !== undefined && userBet) {
            setFlipResult(isWinner ? userBet : userBet === 'heads' ? 'tails' : 'heads'); // Show correct side based on outcome
            setIsAnimating(false); // Stop animation
            setGameState(isWinner ? "you won" : "you lost");
            setModalMessage(isWinner ? "You won!" : "You lost!");
        } else if (isWinner === undefined) {
            setGameState("waiting for bet");
        }

        const handleTransactionSigningFailed = () => {
            setGameState('waiting for bet');
        };

        window.addEventListener('ton-connect-ui-transaction-signing-failed', handleTransactionSigningFailed);

        return () => {
            window.removeEventListener('ton-connect-ui-transaction-signing-failed', handleTransactionSigningFailed);
        };
    }, [isWinner, connected, userBet], 300);

    const handleCloseModal = () => {
        setModalMessage(null);
        setGameState("waiting for bet");
        setUserBet(null); // Reset user's bet
    };

    const handleBet = (betType: 'heads' | 'tails') => {
        if (betType === 'heads') {
            betOnHeads(betAmount);
        } else {
            betOnTails(betAmount);
        }
        setUserBet(betType);
        setGameState("game in progress");
        setShowCountdown(true); // Show countdown when the bet is placed
    };

    // Callback when countdown completes
    const handleCountdownComplete = () => {
        setIsAnimating(true); // Start the coin flip animation
        setShowCountdown(false); // Hide the countdown
    };

    // Callback when coin flip animation completes
    const handleCoinFlipComplete = () => {
        setIsAnimating(false); // Stop animation
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
                            onClick={() => handleBet('heads')}
                            disabled={!isBetAmountValid || gameState === "game in progress"} // Disable button during game in progress
                        >
                            Bet on Heads
                        </button>
                        <button
                            className="action-button"
                            onClick={() => handleBet('tails')}
                            disabled={!isBetAmountValid || gameState === "game in progress"} // Disable button during game in progress
                        >
                            Bet on Tails
                        </button>
                    </div>
                )}

                {gameState === "game in progress" && showCountdown && (
                    <Countdown duration={5} onComplete={handleCountdownComplete} /> // Show countdown before coin flip
                )}

                {isAnimating && flipResult && (
                    <CoinFlip result={flipResult} onAnimationComplete={handleCoinFlipComplete} /> // Show coin flip animation
                )}

                {modalMessage && (
                    <Modal message={modalMessage} onClose={handleCloseModal} />
                )}
            </main>
        </div>
    );
}

export default App;
