import React, { useState, useEffect } from 'react';
import { database } from '../firebase';
import { ref, update } from 'firebase/database';
import Chat from './Chat';

const Game = ({ roomId, players, myId, gameData, isHost, playerName, gameState }) => {
    const isLiar = gameData?.liar === myId;
    const [showIdentity, setShowIdentity] = useState(false);
    const [guessWord, setGuessWord] = useState('');

    // Phase 1: Game Loop (Discussion)
    // Phase 2: Voting
    const hasVoted = gameData.votes && gameData.votes[myId];

    // Phase 3: Result & Liar Guess
    const voteResultId = gameData.voteResult;
    const isTargeted = voteResultId === myId;
    const targetName = players[voteResultId]?.name || 'Unknown';

    // Helper Header Component
    const PlayerHeader = () => (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0,
            background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(5px)',
            padding: '10px', borderBottom: '1px solid #333', zIndex: 100,
            display: 'flex', justifyContent: 'center', gap: '15px', flexWrap: 'wrap'
        }}>
            {Object.entries(players).map(([pid, p]) => (
                <span key={pid} style={{
                    color: pid === myId ? '#fff' : '#888',
                    fontWeight: pid === myId ? 'bold' : 'normal',
                    fontSize: '0.8rem',
                    border: pid === myId ? '1px solid #fff' : '1px solid transparent',
                    padding: '2px 8px', borderRadius: '12px'
                }}>
                    {p.name} {p.isHost && '👑'}
                </span>
            ))}
        </div>
    );

    const handleNextRound = () => {
        // Only host can trigger this
        if (!isHost) {
            console.warn('[Game] Not host, ignoring next round click');
            return;
        }

        const current = Number(gameData.currentRound);
        const total = Number(gameData.totalRounds);

        console.log(`[Game] Next Round Clicked. Current: ${current}, Total: ${total}`);

        if (current < total) {
            console.log(`[Game] Advancing to round ${current + 1}`);

            // Re-shuffle for next round
            const nextTurnOrder = [...gameData.turnOrder];
            for (let i = nextTurnOrder.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [nextTurnOrder[i], nextTurnOrder[j]] = [nextTurnOrder[j], nextTurnOrder[i]];
            }

            update(ref(database, `rooms/${roomId}`), {
                currentRound: current + 1,
                turnOrder: nextTurnOrder,
                turnIndex: 0
            }).catch(err => console.error('[Game] Failed to update round:', err));
        } else {
            console.log('[Game] Max rounds reached. Moving to VOTING phase.');
            update(ref(database, `rooms/${roomId}`), {
                status: 'voting'
            }).then(() => {
                console.log('[Game] Status updated to voting');
            }).catch(err => console.error('[Game] Failed to update status to voting:', err));
        }
    };

    const handleVote = (targetId) => {
        if (hasVoted) return;
        update(ref(database, `rooms/${roomId}/votes/${myId}`), {
            target: targetId
        });
    };

    // Host checks votes
    useEffect(() => {
        if (isHost && gameData.votes && !gameData.voteResult) {
            const voteCount = Object.keys(gameData.votes).length;
            const playerCount = Object.keys(players).length;

            // Make sure we have enough votes (wait for everyone)
            if (voteCount >= playerCount) {
                const tallies = {};
                Object.values(gameData.votes).forEach(v => {
                    tallies[v.target] = (tallies[v.target] || 0) + 1;
                });

                let maxVotes = 0;
                let targetId = null;

                // Simple tie-breaking: just take the first max found
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

    const submitLiarGuess = () => {
        if (!guessWord.trim()) return;

        const isCorrect = guessWord.trim() === gameData.word.trim();
        const winner = isCorrect ? 'liar' : 'citizens';

        update(ref(database, `rooms/${roomId}`), {
            winner: winner,
            liarGuess: guessWord
        });
    };

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


    // --- Render ---

    // 1. Voting Phase (Check gameState explicitily)
    if (!gameData.winner && gameState === 'voting') {
        return (
            <div className="container" style={{ paddingTop: '60px' }}>
                <PlayerHeader />
                <h1>투표 시간 🗳️</h1>
                <div className="card">
                    <p>라이어라고 생각되는 사람을 선택하세요!</p>
                    <div className="actions">
                        {Object.entries(players).map(([pid, p]) => {
                            const isSelected = hasVoted && gameData.votes && gameData.votes[myId]?.target === pid;
                            const isMyVote = hasVoted && gameData.votes[myId]; // Just to check if I voted

                            return (
                                <button
                                    key={pid}
                                    onClick={() => handleVote(pid)}
                                    disabled={!!hasVoted}
                                    style={{
                                        border: isSelected ? '2px solid white' : '1px solid #333',
                                        opacity: hasVoted && !isSelected ? 0.3 : 1,
                                        background: isSelected ? '#333' : 'black'
                                    }}
                                >
                                    {p.name} {isSelected && '(선택함)'}
                                </button>
                            )
                        })}
                    </div>
                    <p className="status-text">{Object.keys(gameData.votes || {}).length} / {Object.keys(players).length} 명 투표 완료</p>
                </div>
                <Chat roomId={roomId} playerName={playerName} myId={myId} />
            </div>
        )
    }

    // 2. Result Phase / Liar Guess
    if (!gameData.winner && gameState === 'result') {
        // (The rest of result logic...)
        if (isTargeted) {
            return (
                <div className="container" style={{ paddingTop: '60px' }}>
                    <PlayerHeader />
                    <h1>최후의 변론 ⚖️</h1>
                    <div className="card">
                        <h2 style={{ color: '#ff3333' }}>당신은 라이어로 지목되었습니다!</h2>
                        <p>라이어가 맞다면, 제시어를 맞춰 역전할 수 있습니다.</p>
                        <p>제시어가 무엇일까요?</p>

                        <input
                            type="text"
                            placeholder="정답 단어 입력"
                            value={guessWord}
                            onChange={(e) => setGuessWord(e.target.value)}
                        />
                        <button onClick={submitLiarGuess}>정답 제출 (역전승 도전)</button>
                    </div>
                    <Chat roomId={roomId} playerName={playerName} myId={myId} />
                </div>
            )
        } else {
            return (
                <div className="container" style={{ paddingTop: '60px' }}>
                    <PlayerHeader />
                    <h1>최후의 변론 ⚖️</h1>
                    <div className="card">
                        <h2>{targetName} 님이 지목되었습니다.</h2>
                        <p>그가 정답을 맞히면 라이어 승, 틀리면 시민 승입니다.</p>
                        <div className="cursor">...결과 기다리는 중...</div>
                    </div>
                    <Chat roomId={roomId} playerName={playerName} myId={myId} />
                </div>
            )
        }
    }

    // 3. Normal Game Loop (Playing)
    if (!gameData.winner) {
        const displayWord = isLiar ? gameData.liarWord : gameData.word;

        // Turn Logic
        const turnOrder = gameData.turnOrder || [];
        const turnIndex = gameData.turnIndex || 0;
        const currentTurnId = turnOrder[turnIndex];
        const isMyTurn = currentTurnId === myId;
        const currentTurnName = players[currentTurnId]?.name || 'Unknown';

        // Answer handling
        const submitAnswer = () => {
            if (!guessWord.trim()) return;

            // Push to history
            const roundKey = `round${gameData.currentRound}`;
            const newHistoryRef = ref(database, `rooms/${roomId}/answers/${roundKey}`);
            // We can't push array easily without key, so we'll just read/update or push with auto-id
            // Actually, let's just append to a list

            update(ref(database, `rooms/${roomId}`), {
                [`answers/${roundKey}/${turnIndex}`]: {
                    id: myId,
                    name: playerName,
                    text: guessWord
                },
                turnIndex: turnIndex + 1
            });
            setGuessWord('');
        };

        const answers = gameData.answers?.[`round${gameData.currentRound}`] || [];

        return (
            <div className="container" style={{ paddingTop: '60px' }}>
                <PlayerHeader />
                <h1>
                    라운드 {gameData.currentRound} / {gameData.totalRounds}
                </h1>

                <div style={{ width: '100%', maxWidth: '600px', marginBottom: '1rem', textAlign: 'left' }}>
                    <div style={{ background: '#111', padding: '10px', border: '1px solid #333', borderRadius: '4px', height: '150px', overflowY: 'auto' }}>
                        <h4 style={{ margin: '0 0 10px 0', borderBottom: '1px solid #333', color: '#888' }}>📝 이번 라운드 기록</h4>
                        {answers && Object.values(answers).map((ans, idx) => (
                            <div key={idx} style={{ marginBottom: '5px', fontSize: '0.9rem' }}>
                                <span style={{ color: ans.id === myId ? '#fff' : '#aaa', fontWeight: 'bold' }}>{ans.name}:</span> {ans.text}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="card">
                    {!showIdentity ? (
                        <div style={{ textAlign: 'center', padding: '2rem' }}>
                            <button onClick={() => setShowIdentity(true)} style={{ fontSize: '1.2rem', padding: '1rem 2rem' }}>
                                🔒 제시어 확인하기
                            </button>
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', animation: 'fadeIn 0.5s' }}>
                            <div style={{ margin: '1rem 0', padding: '1rem', background: '#222', borderRadius: '4px', border: '1px solid #444' }}>
                                <p style={{ color: '#888', margin: 0, fontSize: '0.7rem' }}>MY WORD</p>
                                <h3 style={{ margin: '0.5rem 0', fontSize: '1.5rem', color: 'white', border: 'none' }}>
                                    {displayWord} <span style={{ fontSize: '0.8rem', color: '#666' }}>({gameData?.category})</span>
                                </h3>
                            </div>

                            <div style={{ marginTop: '2rem', padding: '1rem', border: '1px solid #333', background: '#0a0a0a' }}>
                                {turnIndex < turnOrder.length ? (
                                    <>
                                        <p style={{ color: '#aaa', fontSize: '0.9rem' }}>발언 순서</p>
                                        <h2 style={{ margin: '0.5rem 0', color: isMyTurn ? '#00ff00' : 'white' }}>
                                            {isMyTurn ? '당신의 차례입니다!' : `${currentTurnName} 님의 차례`}
                                        </h2>

                                        {isMyTurn ? (
                                            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                                                <input
                                                    type="text"
                                                    value={guessWord}
                                                    onChange={(e) => setGuessWord(e.target.value)}
                                                    placeholder="설명을 입력하세요..."
                                                    autoFocus
                                                />
                                                <button onClick={submitAnswer} style={{ width: 'auto' }}>입력</button>
                                            </div>
                                        ) : (
                                            <div style={{ marginTop: '1rem', color: '#666', fontSize: '0.8rem' }}>
                                                답변을 기다리는 중...
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div style={{ color: '#888' }}>
                                        <p>모든 플레이어가 발언했습니다.</p>
                                        {isHost && <p style={{ color: '#00ff00' }}>다음 라운드 혹은 투표를 진행해주세요.</p>}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    <div style={{ marginTop: '2rem' }}>
                        {isHost && (
                            <button onClick={handleNextRound} disabled={turnIndex < turnOrder.length}>
                                {gameData.currentRound < gameData.totalRounds ? '다음 라운드 진행 >' : '투표 시작하기 >'}
                            </button>
                        )}
                        {!isHost && (
                            <p className="status-text">
                                {turnIndex < turnOrder.length ? '발언 진행 중...' : '방장이 다음 단계를 준비 중입니다.'}
                            </p>
                        )}
                    </div>
                </div>

                <Chat roomId={roomId} playerName={playerName} myId={myId} />
            </div>
        );
    }

    // 4. Game End
    const liarWon = gameData.winner === 'liar';
    return (
        <div className="container" style={{ paddingTop: '60px' }}>
            <PlayerHeader />
            <h1>게임 종료</h1>
            <div className="card" style={{ borderColor: liarWon ? '#ff3333' : '#00ff00' }}>
                <div style={{ fontSize: '4rem', margin: '1rem 0' }}>
                    {liarWon ? '😈' : '😇'}
                </div>
                <h2>{liarWon ? '라이어 승리!' : '시민 승리!'}</h2>

                <div style={{ margin: '2rem 0', textAlign: 'left', background: '#222', padding: '1rem' }}>
                    <p>라이어: <strong>{players[gameData.liar]?.name}</strong></p>
                    <p>진짜 제시어 (시민): <strong style={{ color: '#00ff00' }}>{gameData.word}</strong></p>
                    <p>가짜 제시어 (라이어): <strong style={{ color: '#ff3333' }}>{gameData.liarWord}</strong></p>
                    {gameData.liarGuess && <p>라이어의 마지막 추측: {gameData.liarGuess}</p>}
                </div>

                {isHost && (
                    <button onClick={() => {
                        update(ref(database, `rooms/${roomId}`), { status: 'waiting', votes: null, voteResult: null, winner: null, totalRounds: null, currentRound: null, liarWord: null });
                    }}>대기실로 돌아가기</button>
                )}
            </div>
            <Chat roomId={roomId} playerName={playerName} myId={myId} />
        </div>
    )
};

export default Game;
