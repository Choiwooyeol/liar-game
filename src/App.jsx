import { useState, useEffect } from 'react'
import { database } from './firebase'
import { ref, onValue } from 'firebase/database'
import { v4 as uuidv4 } from 'uuid';
import Lobby from './components/Lobby'
import Room from './components/Room'
import Game from './components/Game'
import './index.css'

function App() {
    const [gameState, setGameState] = useState('lobby') // lobby, room, game
    const [playerName, setPlayerName] = useState('')
    const [roomId, setRoomId] = useState('')
    const [players, setPlayers] = useState({})
    const [myId, setMyId] = useState('')
    const [isHost, setIsHost] = useState(false)
    const [error, setError] = useState('')

    const [gameData, setGameData] = useState({});

    // Generate a player ID on mount if not exists
    useEffect(() => {
        let id = localStorage.getItem('liar_player_id');
        if (!id) {
            id = uuidv4();
            localStorage.setItem('liar_player_id', id);
        }
        setMyId(id);
    }, []);

    // Listen to room data changes when allowed
    useEffect(() => {
        if (!roomId) return;

        const roomRef = ref(database, `rooms/${roomId}`);
        const unsubscribe = onValue(roomRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                setPlayers(data.players || {});

                // Store game-specific data
                if (data.liar && data.word && data.category) {
                    setGameData({
                        liar: data.liar,
                        word: data.word,
                        liarWord: data.liarWord, // Pass the fake word
                        category: data.category,
                        totalRounds: data.totalRounds || 1,
                        currentRound: data.currentRound || 1,
                        votes: data.votes || {},
                        voteResult: data.voteResult || null,
                        winner: data.winner || null
                    });
                }

                // Check game status
                console.log(`[App] Room Update: Status=${data.status}, GameState=${gameState}`);

                // Force state sync
                if (data.status === 'playing' && gameState !== 'game') {
                    console.log('[App] Transitioning to GAME');
                    setGameState('game');
                } else if (data.status === 'voting') {
                    // Check current internal state to prevent loop if already set, but ensure UI updates
                    if (gameState !== 'voting') {
                        console.log('[App] Transitioning to VOTING');
                        setGameState('voting');
                    }
                } else if (data.status === 'result' && gameState !== 'result') {
                    console.log('[App] Transitioning to RESULT');
                    setGameState('result');
                } else if (data.status === 'waiting' && gameState !== 'room' && gameState !== 'lobby') {
                    // Game Restarted
                    console.log('[App] Transitioning back to ROOM (Restart)');
                    setGameState('room');
                    setGameData({}); // Clear game data
                }
            } else {
                console.log('[App] No Data or Room deleted');
                // Room deleted or doesn't exist
                if (gameState !== 'lobby') {
                    setGameState('lobby');
                    setRoomId('');
                    setError('Room closed or does not exist.');
                    setGameData({});
                }
            }
        });

        return () => unsubscribe();
    }, [roomId, gameState]);

    return (
        <>
            {error && <div className="error-toast" onClick={() => setError('')}>{error}</div>}

            {gameState === 'lobby' && (
                <Lobby
                    playerName={playerName}
                    setPlayerName={setPlayerName}
                    setRoomId={setRoomId}
                    setGameState={setGameState}
                    setIsHost={setIsHost}
                    setError={setError}
                    myId={myId}
                />
            )}

            {gameState === 'room' && (
                <Room
                    roomId={roomId}
                    players={players}
                    isHost={isHost}
                    myId={myId}
                />
            )}

            {(gameState === 'game' || gameState === 'voting' || gameState === 'result') && (
                <Game
                    roomId={roomId}
                    players={players}
                    myId={myId}
                    gameData={gameData}
                    isHost={isHost}
                    playerName={playerName}
                    gameState={gameState}
                />
            )}
        </>
    )
}

export default App
