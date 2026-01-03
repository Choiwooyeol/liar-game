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
        <div className="container" style={{ maxWidth: '400px' }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <p style={{ color: '#888', margin: 0, fontSize: '0.9rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>ROOM CODE</p>
                <h1 style={{ margin: '0.5rem 0 0 0', fontSize: '4rem', letterSpacing: '0.1em', color: '#fff', border: 'none', lineHeight: 1 }}>{roomId}</h1>
            </div>

            <div className="card" style={{ padding: '2rem', border: '1px solid #333', background: '#050505', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
                <div style={{ marginBottom: '2rem' }}>
                    <h3 style={{ margin: 0, color: '#fff', fontSize: '1rem', borderBottom: '1px solid #333', paddingBottom: '10px', display: 'flex', justifyContent: 'space-between' }}>
                        PLAYERS
                        <span style={{ color: '#666' }}>{Object.keys(players).length} / 20</span>
                    </h3>

                    <ul className="player-list" style={{ marginTop: '1rem', maxHeight: '300px', overflowY: 'auto' }}>
                        {Object.entries(players).map(([id, p]) => (
                            <li key={id} style={{
                                padding: '12px 0', borderBottom: '1px solid #111',
                                color: id === myId ? '#fff' : '#888',
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                            }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    {id === myId && <span style={{ color: '#fff', fontSize: '0.8rem' }}>▶</span>}
                                    {p.name}
                                </span>
                                {p.isHost && <span className="badge-host" style={{ background: '#333', color: '#fff', border: '1px solid #666' }}>HOST</span>}
                            </li>
                        ))}
                    </ul>
                </div>

                {isHost ? (
                    <div style={{ animation: 'fadeIn 0.5s' }}>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '8px', color: '#666', fontSize: '0.7rem', fontWeight: 'bold' }}>TOTAL ROUNDS</label>
                            <select
                                value={rounds}
                                onChange={(e) => setRounds(Number(e.target.value))}
                                style={{ background: '#111', color: '#fff', border: '1px solid #333', padding: '12px', textAlign: 'center' }}
                            >
                                {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                                    <option key={num} value={num}>{num} 라운드</option>
                                ))}
                            </select>
                        </div>
                        <button
                            onClick={startGame}
                            style={{ background: '#fff', color: '#000', border: '1px solid #fff', padding: '16px', fontSize: '1.2rem', fontWeight: 'bold' }}
                        >
                            GAME START
                        </button>
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', padding: '2rem 0', color: '#444' }}>
                        <div style={{ fontSize: '2rem', marginBottom: '1rem', animation: 'pulse 2s infinite' }}>⏳</div>
                        <p style={{ margin: 0, fontSize: '0.9rem' }}>WAITING FOR HOST...</p>
                    </div>
                )}
            </div>

            <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                <button
                    className="secondary"
                    onClick={() => window.location.reload()}
                    style={{ border: 'none', color: '#444', fontSize: '0.8rem', textDecoration: 'underline', width: 'auto', padding: '5px' }}
                >
                    LEAVE ROOM
                </button>
            </div>
        </div>
    );
};

export default Room;
