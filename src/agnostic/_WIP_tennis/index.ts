export namespace Tennis {
  type Game = Array<boolean>
  
  type Game_Lost_Half_Score = 3 | 2 | 1 | 0
  type Game_Ad_Half_Score = 4
  type Game_Win_Half_Score = 5
  type Game_A_Wins_End_Score = [Game_Win_Half_Score, Game_Lost_Half_Score]
  type Game_B_Wins_End_Score = [Game_Lost_Half_Score, Game_Win_Half_Score]
  type Game_End_Score = Game_A_Wins_End_Score | Game_B_Wins_End_Score
  type Game_Running_Score = [Game_Ad_Half_Score, 40] | [40, Game_Ad_Half_Score] | [Game_Lost_Half_Score, Game_Lost_Half_Score]
  type Game_Score = Game_End_Score | Game_Running_Score

  type Set = Array<Game>
  
  type Set_Lost_Half_Score_No_5 = 0 | 1 | 2 | 3 | 4
  type Set_Lost_Half_Score = Set_Lost_Half_Score_No_5 | 5
  type Set_A_Wins_End_Score = [7, 6] | [6, Set_Lost_Half_Score_No_5]
  type Set_B_Wins_End_Score = [6, 7] | [Set_Lost_Half_Score_No_5, 6]
  type Set_End_Score = Set_A_Wins_End_Score | Set_B_Wins_End_Score
  type Set_Running_Score = [6 | 5, 6 | 5] | [Set_Lost_Half_Score, Set_Lost_Half_Score]
  type Set_Score = Set_End_Score | Set_Running_Score
    
  type Match = Array<Set>
  type Match_3_Sets_A_Wins_End_Score = [Set_A_Wins_End_Score, Set_A_Wins_End_Score]
    | [Set_A_Wins_End_Score, Set_B_Wins_End_Score, Set_A_Wins_End_Score]
    | [Set_B_Wins_End_Score, Set_A_Wins_End_Score, Set_A_Wins_End_Score]
  type Match_3_Sets_B_Wins_End_Score = [Set_B_Wins_End_Score, Set_B_Wins_End_Score]
    | [Set_B_Wins_End_Score, Set_A_Wins_End_Score, Set_B_Wins_End_Score]
    | [Set_A_Wins_End_Score, Set_B_Wins_End_Score, Set_B_Wins_End_Score]
  type Match_3_Sets_End_Score = Match_3_Sets_A_Wins_End_Score | Match_3_Sets_B_Wins_End_Score
  type Match_3_Sets_Running_Score = [Set_Running_Score]
    | [Set_A_Wins_End_Score, Set_Running_Score]
    | [Set_B_Wins_End_Score, Set_Running_Score]
    | [Set_A_Wins_End_Score, Set_B_Wins_End_Score, Set_Running_Score]
    | [Set_B_Wins_End_Score, Set_A_Wins_End_Score, Set_Running_Score]
  type Match_3_Sets_Score = Match_3_Sets_End_Score | Match_3_Sets_Running_Score

  function getGameScore (game: Game): Game_Score {
    const score = [0, 0] as Game_Score
    game.forEach(point => {
      // Game already won
      if ((score as number[]).includes(5)) return;
      const winnerPos = point ? 0 : 1
      const loserPos = point ? 1 : 0
      const winnerCurrScore = score[winnerPos] as Game_Lost_Half_Score | Game_Ad_Half_Score | Game_Win_Half_Score
      const loserCurrScore = score[loserPos] as Game_Lost_Half_Score | Game_Ad_Half_Score | Game_Win_Half_Score
      if (loserCurrScore === 5 || winnerCurrScore === 5) return;
      // 40-AD
      if (loserCurrScore === 4 && winnerCurrScore === 3) {
        score[loserPos] = 3
        return;
      }
      // AD-40
      if (loserCurrScore === 3 && winnerCurrScore === 4) {
        score[winnerPos] = 5
        return;
      }
      // Winner is at 40 (go to game without AD)
      if (winnerCurrScore === 3) {
        score[winnerPos] = 5
        return;
      }
      // Any other case just increments the score
      score[winnerPos] ++
      return;
    })
    return score
  }

  function getGameWinner (gameScore: Game_Score) {
    const [scoreA, scoreB] = gameScore
    if (scoreA === 5) return true
    if (scoreB === 5) return false
    return null
  }

  function getSetScore (set: Set): Set_Score {
    const score = [0, 0] as Set_Score
    let foundUnfinishedGame = false
    set.forEach(game => {
      if (foundUnfinishedGame) return;
      if ((score as number[]).includes(7)) return;
      const [scoreA, scoreB] = score
      if (scoreA >= 6 && scoreB < 5) return;
      if (scoreB <= 6 && scoreA < 5) return;
      const gameScore = getGameScore(game)
      const gameWinner = getGameWinner(gameScore)
      if (gameWinner === true) {
        score[0] ++
        return;
      }
      if (gameWinner === false) {
        score[1] ++
        return;
      }
      foundUnfinishedGame = true
    })
    return score
  }
}
