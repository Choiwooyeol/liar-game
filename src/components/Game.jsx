import React, { useState, useEffect } from 'react';
import { database } from '../firebase';
import { ref, update } from 'firebase/database';
import Chat from './Chat';
import PlayerHeader from './game/PlayerHeader';
import HistoryModal from './game/HistoryModal';
import InputModal from './game/InputModal';

const Game = ({ roomId, players, myId, gameData, isHost, playerName, gameState }) => {
    // --- 1. All Hooks at Top Level ---
    const [showIdentity, setShowIdentity] = useState(false);
    const [guessWord, setGuessWord] = useState('');
    const [showHistory, setShowHistory] = useState(false);
    const [showInputModal, setShowInputModal] = useState(false);

    // Derived State
    const isLiar = gameData?.liar === myId;
    const hasVoted = gameData.votes && gameData.votes[myId];
    const voteResultId = gameData.voteResult;
    const targetName = players[voteResultId]?.name || 'Unknown';
    const displayWord = isLiar ? gameData.liarWord : gameData.word;

    // Turn Logic Safe Parsing
    let rawTurnOrder = gameData.turnOrder || [];
    if (!Array.isArray(rawTurnOrder)) {
        rawTurnOrder = Object.values(rawTurnOrder);
    }
    const turnOrder = rawTurnOrder;
    const turnIndex = gameData.turnIndex || 0;
    const currentTurnId = turnOrder[turnIndex];
    const isMyTurn = currentTurnId === myId;
    const currentTurnName = players[currentTurnId]?.name || 'Unknown';

    // Prep Time Logic
    const [timeLeft, setTimeLeft] = useState(0);
    const PREP_TIME_MS = 60000; // 60 seconds

    useEffect(() => {
        if (gameState === 'game' && gameData.startTime) {
            const interval = setInterval(() => {
                const elapsed = Date.now() - gameData.startTime;
                const remaining = Math.max(0, Math.ceil((PREP_TIME_MS - elapsed) / 1000));
                setTimeLeft(remaining);
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [gameState, gameData.startTime]);

    const isPrepTime = timeLeft > 0;

    // Auto-open input modal when it's my turn AND prep time is over
    useEffect(() => {
        if (isMyTurn && !gameData.winner && gameState === 'game' && !isPrepTime) {
            setShowInputModal(true);
        } else {
            setShowInputModal(false);
        }
    }, [isMyTurn, gameData.winner, gameState, isPrepTime]);

    // --- 2. Effects ---

    // Host checks votes
    useEffect(() => {
        if (isHost && gameData.votes && !gameData.voteResult) {
            const voteCount = Object.keys(gameData.votes).length;
            const playerCount = Object.keys(players).length;

            if (voteCount >= playerCount) {
                const tallies = {};
                Object.values(gameData.votes).forEach(v => {
                    tallies[v.target] = (tallies[v.target] || 0) + 1;
                });

                let maxVotes = 0;
                let targetId = null;

                for (const [pid, count] of Object.entries(tallies)) {
                    if (count > maxVotes) {
                        maxVotes = count;
                        targetId = pid;
                    }
                }

                if (targetId) {
                    update(ref(database, `rooms/${roomId}`), {
                        status: 'result',
                        voteResult: targetId
                    });
                }
            }
        }
    }, [gameData.votes, isHost, players, roomId, gameData.voteResult]);

    // If citizen was voted out, Liar wins immediately
    useEffect(() => {
        if (isHost && gameData.voteResult && !gameData.winner) {
            if (gameData.voteResult !== gameData.liar) {
                update(ref(database, `rooms/${roomId}`), {
                    winner: 'liar'
                });
            }
        }
    }, [gameData.voteResult, isHost, gameData.liar, roomId, gameData.winner]);

    // --- 3. Action Handlers ---

    const handleNextRound = () => {
        if (!isHost) return;

        const current = Number(gameData.currentRound);
        const total = Number(gameData.totalRounds);

        if (current < total) {
            // Re-shuffle for next round
            const nextTurnOrder = [...turnOrder];
            for (let i = nextTurnOrder.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [nextTurnOrder[i], nextTurnOrder[j]] = [nextTurnOrder[j], nextTurnOrder[i]];
            }

            update(ref(database, `rooms/${roomId}`), {
                currentRound: current + 1,
                turnOrder: nextTurnOrder,
                turnIndex: 0
            });
        } else {
            update(ref(database, `rooms/${roomId}`), {
                status: 'voting'
            });
        }
    };

    const handleVote = (targetId) => {
        if (hasVoted) return;
        update(ref(database, `rooms/${roomId}/votes/${myId}`), {
            target: targetId
        });
    };

    const submitLiarGuess = () => {
        if (!guessWord.trim()) return;
        const isCorrect = guessWord.trim() === gameData.word.trim();
        update(ref(database, `rooms/${roomId}`), {
            winner: isCorrect ? 'liar' : 'citizens',
            liarGuess: guessWord
        });
    };

    const submitAnswer = () => {
        if (!guessWord.trim()) return;
        const roundKey = `round${gameData.currentRound}`;
        update(ref(database, `rooms/${roomId}`), {
            [`answers/${roundKey}/${turnIndex}`]: {
                id: myId,
                name: playerName,
                text: guessWord
            },
            turnIndex: turnIndex + 1
        });
        setGuessWord('');
        setShowInputModal(false);
    };

    const [elapsedTime, setElapsedTime] = useState('00:00');

    // ... (existing hooks)

    // Timer Effect
    useEffect(() => {
        if (!gameData.startTime || gameData.winner) return;

        const interval = setInterval(() => {
            const now = Date.now();
            const start = gameData.startTime;
            const diff = Math.max(0, now - start);

            const minutes = Math.floor(diff / 60000);
            const seconds = Math.floor((diff % 60000) / 1000);

            setElapsedTime(
                `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
            );
        }, 1000);

        return () => clearInterval(interval);
    }, [gameData.startTime, gameData.winner]);

    // --- 4. Main Render ---
    return (
        <div className="container" style={{ maxWidth: '400px', width: '100%', paddingTop: '80px', paddingBottom: '20px', position: 'relative' }}>
            {/* Top Bar with Timer */}
            <div style={{
                position: 'fixed', top: 0, left: 0, right: 0,
                height: '60px', background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(5px)',
                display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100,
                borderBottom: '1px solid #333'
            }}>
                <div style={{ fontSize: '1.2rem', fontFamily: 'monospace', color: '#fff', letterSpacing: '2px' }}>
                    ⏱ {elapsedTime}
                </div>
            </div>

            <PlayerHeader players={players} myId={myId} />
            {showHistory && <HistoryModal gameData={gameData} onClose={() => setShowHistory(false)} />}
            {(isMyTurn && showInputModal) && (
                <InputModal
                    value={guessWord}
                    onChange={setGuessWord}
                    onSubmit={submitAnswer}
                />
            )}

            {/* A. Game End Screen */}
            {gameData.winner && (
                <>
                    <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                        <h1 style={{ fontSize: '3rem', margin: 0, color: gameData.winner === 'liar' ? '#fff' : '#fff' }}>GAME OVER</h1>
                        <p style={{ color: '#888', letterSpacing: '0.2em' }}>게임 종료</p>
                    </div>

                    <div className="card" style={{ borderColor: gameData.winner === 'liar' ? '#fff' : '#fff', background: '#050505' }}>
                        <div style={{ fontSize: '5rem', margin: '2rem 0', lineHeight: 1 }}>
                            {gameData.winner === 'liar' ? '😈' : '😇'}
                        </div>
                        <h2 style={{ fontSize: '2rem', borderBottom: '1px solid #333', paddingBottom: '1rem' }}>
                            {gameData.winner === 'liar' ? 'LIAR WINS' : 'CITIZENS WIN'}
                        </h2>

                        <div style={{ margin: '2rem 0', textAlign: 'left', background: '#111', padding: '1.5rem', borderRadius: '4px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                <span style={{ color: '#888' }}>라이어</span>
                                <strong style={{ color: '#fff' }}>{players[gameData.liar]?.name}</strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                <span style={{ color: '#888' }}>진짜 제시어</span>
                                <strong style={{ color: '#fff' }}>{gameData.word}</strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                <span style={{ color: '#888' }}>라이어 제시어</span>
                                <strong style={{ color: '#ccc' }}>{gameData.liarWord}</strong>
                            </div>
                            {gameData.liarGuess && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '15px', paddingTop: '15px', borderTop: '1px solid #333' }}>
                                    <span style={{ color: '#888' }}>라이어의 추측</span>
                                    <strong style={{ color: '#fff' }}>{gameData.liarGuess}</strong>
                                </div>
                            )}
                        </div>

                        {isHost && (
                            <button onClick={() => {
                                update(ref(database, `rooms/${roomId}`), { status: 'waiting', votes: null, voteResult: null, winner: null, totalRounds: null, currentRound: null, liarWord: null });
                            }} style={{ background: '#fff', color: '#000', border: 'none', fontWeight: 'bold' }}>
                                대기실로 돌아가기
                            </button>
                        )}
                    </div>
                </>
            )}

            {/* B. Voting Screen */}
            {!gameData.winner && gameState === 'voting' && (
                <>
                    <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                        <h1 style={{ fontSize: '2.5rem', margin: 0 }}>VOTING</h1>
                        <p style={{ color: '#666', letterSpacing: '0.1em' }}>( 투표 시간 )</p>
                    </div>

                    <div className="card" style={{ border: '1px solid #333', background: '#050505' }}>
                        <p style={{ fontSize: '0.9rem', color: '#ccc', marginBottom: '1.5rem' }}>라이어라고 의심되는 플레이어를 선택하세요.</p>
                        <div className="actions" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                            {Object.entries(players).map(([pid, p]) => {
                                const isSelected = hasVoted && gameData.votes && gameData.votes[myId]?.target === pid;
                                return (
                                    <button
                                        key={pid}
                                        onClick={() => handleVote(pid)}
                                        disabled={!!hasVoted}
                                        style={{
                                            border: '1px solid #fff',
                                            background: isSelected ? '#fff' : 'transparent',
                                            color: isSelected ? '#000' : '#fff',
                                            padding: '15px',
                                            fontSize: '1rem',
                                            opacity: hasVoted && !isSelected ? 0.3 : 1,
                                            cursor: hasVoted ? 'default' : 'pointer',
                                            transition: 'all 0.2s',
                                            height: '60px',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                                        }}
                                    >
                                        {p.name} {isSelected && '👈'}
                                    </button>
                                )
                            })}
                        </div>
                        <div style={{ marginTop: '1.5rem', textAlign: 'center', color: '#666', fontSize: '0.8rem' }}>
                            {Object.keys(gameData.votes || {}).length} / {Object.keys(players).length} VOTED
                        </div>
                    </div>
                </>
            )}

            {/* C. Result Screen */}
            {!gameData.winner && gameState === 'result' && (
                <>
                    <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                        <h1 style={{ fontSize: '2.5rem', margin: 0 }}>FINAL DEFENSE</h1>
                        <p style={{ color: '#666', letterSpacing: '0.1em' }}>최후의 변론</p>
                    </div>

                    <div className="card" style={{ background: '#050505', border: '1px solid #333' }}>
                        {gameData.voteResult === myId ? (
                            <div style={{ textAlign: 'center' }}>
                                <h2 style={{ color: '#fff', fontSize: '1.5rem', marginBottom: '1rem' }}>당신이 지목되었습니다!</h2>
                                <p style={{ color: '#aaa', fontSize: '0.9rem', lineHeight: '1.6', marginBottom: '2rem' }}>
                                    만약 당신이 라이어라면,<br />
                                    <strong style={{ color: '#fff' }}>제시어를 맞추어 역전승</strong>할 수 있습니다.
                                </p>
                                <input
                                    type="text"
                                    placeholder="정답 단어 입력"
                                    value={guessWord}
                                    onChange={(e) => setGuessWord(e.target.value)}
                                    style={{ textAlign: 'center', fontSize: '1.2rem', padding: '15px', marginBottom: '1rem', background: '#111', color: '#fff', border: '1px solid #333' }}
                                />
                                <button onClick={submitLiarGuess} style={{ background: '#fff', color: '#000', fontWeight: 'bold' }}>
                                    정답 제출
                                </button>
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚖️</div>
                                <h2 style={{ fontSize: '1.2rem', color: '#fff' }}>
                                    <span style={{ borderBottom: '1px solid #fff', paddingBottom: '2px' }}>{targetName}</span> 님이 지목되었습니다.
                                </h2>
                                <p style={{ color: '#666', marginTop: '1rem' }}>최후의 변론 및 결과 대기 중...</p>
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* D. Playing Screen (Default) */}
            {!gameData.winner && gameState === 'game' && (
                <>
                    <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                        <p style={{ color: '#666', fontSize: '0.8rem', letterSpacing: '0.15em', marginBottom: '0.5rem' }}>ROUND</p>
                        <h1 style={{ fontSize: '3.5rem', margin: 0, lineHeight: 1, color: '#fff' }}>
                            {gameData.currentRound} <span style={{ fontSize: '1.5rem', color: '#444' }}>/ {gameData.totalRounds}</span>
                        </h1>
                    </div>

                    <div className="card" style={{ marginBottom: '1.5rem', padding: '1.5rem', border: '1px solid #333', background: '#050505' }}>
                        {!showIdentity ? (
                            <button
                                onClick={() => setShowIdentity(true)}
                                style={{
                                    width: '100%', padding: '20px', background: '#111',
                                    border: '1px dashed #444', color: '#888',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                                    cursor: 'pointer', transition: 'all 0.2s'
                                }}
                                onMouseOver={(e) => { e.target.style.background = '#151515'; e.target.style.borderColor = '#666'; }}
                                onMouseOut={(e) => { e.target.style.background = '#111'; e.target.style.borderColor = '#444'; }}
                            >
                                🔒 제시어 확인하기 (CLICK)
                            </button>
                        ) : (
                            <div style={{ textAlign: 'center', animation: 'fadeIn 0.3s' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #222', paddingBottom: '10px' }}>
                                    <span style={{ fontSize: '0.8rem', color: '#666', letterSpacing: '0.1em' }}>TOPIC</span>
                                    <span style={{ fontSize: '0.9rem', color: '#fff', fontWeight: 'bold' }}>{gameData?.category}</span>
                                </div>

                                <h2 style={{ margin: '1rem 0 2rem 0', fontSize: '2.5rem', color: '#fff' }}>
                                    {displayWord}
                                </h2>

                                <button onClick={() => setShowIdentity(false)} className="secondary" style={{ padding: '8px 16px', fontSize: '0.8rem', width: 'auto' }}>
                                    🙈 가리기
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="card" style={{ padding: '0', border: 'none', background: 'transparent', boxShadow: 'none' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h3 style={{ margin: 0, fontSize: '0.9rem', color: '#888', letterSpacing: '0.1em' }}>TURN ORDER</h3>
                            <button onClick={() => setShowHistory(true)} style={{ width: 'auto', padding: '4px 8px', fontSize: '0.7rem', background: 'transparent', border: '1px solid #444', color: '#888' }}>
                                HISTORY
                            </button>
                        </div>

                        {/* Visual Turn Order */}
                        <div style={{
                            display: 'flex', gap: '8px', overflowX: 'auto', padding: '4px', marginBottom: '1.5rem',
                            scrollBehavior: 'smooth', WebkitOverflowScrolling: 'touch'
                        }}>
                            {turnOrder.map((pid, idx) => {
                                const pName = players[pid]?.name || 'Unknown';
                                const isCurrent = idx === turnIndex;
                                const isPast = idx < turnIndex;
                                return (
                                    <div key={idx} style={{
                                        flex: '0 0 auto',
                                        padding: '8px 16px',
                                        borderRadius: '20px',
                                        background: isCurrent ? '#fff' : (isPast ? '#111' : '#050505'),
                                        color: isCurrent ? '#000' : (isPast ? '#444' : '#666'),
                                        fontSize: '0.8rem',
                                        fontWeight: isCurrent ? 'bold' : 'normal',
                                        border: isCurrent ? '1px solid #fff' : '1px solid #333',
                                        opacity: isPast ? 0.5 : 1
                                    }}>
                                        <span style={{ marginRight: '5px', opacity: 0.5 }}>{idx + 1}</span>
                                        {pName}
                                    </div>
                                )
                            })}
                        </div>

                        {/* Current Turn Status */}
                        <div style={{ padding: '2rem', border: '1px solid #fff', background: '#000', borderRadius: '4px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
                            {/* Decorative corner */}
                            <div style={{ position: 'absolute', top: 0, left: 0, width: '10px', height: '10px', borderTop: '2px solid #fff', borderLeft: '2px solid #fff' }}></div>
                            <div style={{ position: 'absolute', bottom: 0, right: 0, width: '10px', height: '10px', borderBottom: '2px solid #fff', borderRight: '2px solid #fff' }}></div>

                            {isPrepTime ? (
                                <div style={{ animation: 'pulse 1s infinite' }}>
                                    <p style={{ color: '#888', fontSize: '0.8rem', letterSpacing: '0.2em', marginBottom: '1rem' }}>PREPARE TIME</p>
                                    <div style={{ fontSize: '3.5rem', fontWeight: 'bold', color: '#fff', lineHeight: 1 }}>
                                        {timeLeft}<span style={{ fontSize: '1rem' }}>s</span>
                                    </div>
                                    <p style={{ color: '#666', fontSize: '0.8rem', marginTop: '1rem' }}>
                                        제시어를 확인하고 전략을 세우세요
                                    </p>
                                </div>
                            ) : (
                                <>
                                    {turnIndex < turnOrder.length ? (
                                        <>
                                            <p style={{ color: '#666', fontSize: '0.8rem', letterSpacing: '0.2em', marginBottom: '0.5rem' }}>CURRENT TURN</p>
                                            <h2 style={{ margin: '0.5rem 0', color: isMyTurn ? '#fff' : '#888', fontSize: '1.8rem' }}>
                                                {isMyTurn ? 'YOUR TURN' : currentTurnName}
                                            </h2>
                                            {isMyTurn ? (
                                                <div style={{ marginTop: '1rem', padding: '5px 10px', background: '#111', display: 'inline-block', fontSize: '0.8rem', color: '#fff', border: '1px solid #333' }}>
                                                    📢 발언을 입력하세요
                                                </div>
                                            ) : (
                                                <p style={{ color: '#444', fontSize: '0.8rem', marginTop: '0.5rem' }}>발언 중...</p>
                                            )}
                                        </>
                                    ) : (
                                        <div style={{ padding: '1rem 0' }}>
                                            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>✅</div>
                                            <p style={{ color: '#fff', fontWeight: 'bold', marginBottom: '1rem' }}>ROUND COMPLETE</p>
                                            {isHost ? (
                                                <button
                                                    onClick={handleNextRound}
                                                    style={{ background: '#fff', color: '#000', fontSize: '0.9rem', width: 'auto', padding: '10px 20px', border: 'none' }}
                                                >
                                                    {gameData.currentRound < gameData.totalRounds ? 'NEXT ROUND >' : 'START VOTING >'}
                                                </button>
                                            ) : (
                                                <p style={{ color: '#666', fontSize: '0.8rem' }}>Waiting for host...</p>
                                            )}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </>
            )}

            <Chat roomId={roomId} playerName={playerName} myId={myId} />
        </div>
    );
};

export default Game;
