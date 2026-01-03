import React from 'react';
import { database } from '../firebase';
import { ref, update } from 'firebase/database';
import { WORDS } from '../words';

const Room = ({ roomId, players, isHost, myId }) => {
    const [rounds, setRounds] = React.useState(1);

    const startGame = () => {
        // 1. Pick a random category
        const categories = Object.keys(WORDS);
        const randomCategory = categories[Math.floor(Math.random() * categories.length)];

        // 2. Pick a random word from that category
        const wordsList = WORDS[randomCategory];
        const wordIndex = Math.floor(Math.random() * wordsList.length);
        const randomWord = wordsList[wordIndex];

        // 3. Pick a random Liar
        const playerIds = Object.keys(players);
        const randomLiarId = playerIds[Math.floor(Math.random() * playerIds.length)];

        // 4. Pick a Fake Word for Liar (ensure it's different)
        // If only 1 word exists, we can't do this trick properly, but assumed list is large
        let fakeWordIndex;
        do {
            fakeWordIndex = Math.floor(Math.random() * wordsList.length);
        } while (fakeWordIndex === wordIndex && wordsList.length > 1);
        const fakeWord = wordsList[fakeWordIndex];

        // 5. Shuffle Order for Turns
        const turnOrder = [...playerIds];
        // Fisher-Yates shuffle
        for (let i = turnOrder.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [turnOrder[i], turnOrder[j]] = [turnOrder[j], turnOrder[i]];
        }

        // 6. Update Database
        update(ref(database, `rooms/${roomId}`), {
            status: 'playing',
            startTime: Date.now(),
            category: randomCategory,
            word: randomWord,
            liar: randomLiarId,
            liarWord: fakeWord, // Save the fake word
            totalRounds: rounds,
            currentRound: 1,
            turnOrder: turnOrder, // Saved shuffled order
            turnIndex: 0, // Start with first player in order
            answers: {}, // Reset answers
            votes: {},
            voteResult: null,
            winner: null
        });
    };

    return (
        <div className="container">
            <h1>방 번호: {roomId}</h1>
            <div className="card">
                <h3>플레이어 ({Object.keys(players).length})</h3>
                <ul className="player-list">
                    {Object.entries(players).map(([id, p]) => (
                        <li key={id} className={id === myId ? 'me' : ''}>
                            <span>{p.name} {p.isHost ? '👑' : ''}</span>
                        </li>
                    ))}
                </ul>

                {isHost && (
                    <div style={{ margin: '1rem 0' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: '#aaa' }}>게임 라운드 (발언 횟수)</label>
                        <select value={rounds} onChange={(e) => setRounds(Number(e.target.value))}>
                            {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                                <option key={num} value={num}>{num} 라운드</option>
                            ))}
                        </select>
                    </div>
                )}

                <div className="actions" style={{ marginTop: '2rem' }}>
                    {isHost ? (
                        <button onClick={startGame}>게임 시작!</button>
                    ) : (
                        <p className="status-text">방장이 게임을 시작하길 기다리는 중...</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Room;
