 isSending(true, "Game Loading ...");
      const { res, error } = await makeRequest("POST", playGameApi, {gameCode, pubKey:currentUser?.pubkey}, () => { isSending(false,"") }, token,  null,  "urlencoded");
      if (error) {
        setError(error);
        return;
      }

      if (res) {
        // Handle different game statuses
        switch (res.message) {
          case "Player already played game":
            navigate("/leaderboard");
            return;
            
          case "Game ended":
            setError("Game has ended");
            return;
            
          case "Game not started":
            navigate(`/multiplayer/join/${gameCode}`);
            notifySuccess("Game not started yet. Please wait for the host to start the game.");
            return;
            
          case "Game ready to play":
            // Game is ongoing - proceed with game setup
            const gameData: any = {
              letters: res.data.letters.letters || [],
              usage: res.data.letters.usage || {},
              duration: res.data.duration || 120, // Duration in seconds
              startTime: Date.now()
            };
            
            setGameData(gameData);
            
            // Try to load existing game state first
            const stateRestored = loadGameState(gameData);
            
            if (!stateRestored) {
              // No saved state, start fresh game
              startGameWithData(gameData);
            }
            break;
            
          default:
            console.error('Unknown game status:', res.status);
            setError({ message: "Unknown game status" });
            break;
        }
    
    }