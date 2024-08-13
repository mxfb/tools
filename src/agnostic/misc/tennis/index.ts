export namespace Tennis {
  export namespace Score {
    
    /* * * * * * * * * * * * * * * * * * * * *
     * Point
     * * * * * * * * * * * * * * * * * * * * */
    
    export type PointDescriptor = boolean
    
    /* * * * * * * * * * * * * * * * * * * * *
     * Game
     * * * * * * * * * * * * * * * * * * * * */

    export type GameFormat = {
      upTo: number
      diffToWin: number
    }
    
    export class Game {
      private format: GameFormat
      private pointsSequence: PointDescriptor[] = []
  
      constructor (format: GameFormat) {
        this.format = format
      }
      
      add (point: PointDescriptor) {
        if (!this.isFinished()) this.pointsSequence.push(point)
        return this;
      }
      
      getNumericScore (): [number, number] {
        const { pointsSequence, format } = this 
        const { upTo, diffToWin } = format
        return pointsSequence.reduce((
          reduced: [number, number],
          point: PointDescriptor) => {
          const [aScore, bScore] = reduced
          const aWon = aScore >= upTo && aScore - bScore >= diffToWin
          const bWon = bScore >= upTo && bScore - aScore >= diffToWin
          if (aWon || bWon) return reduced
          return point
            ? [aScore + 1, bScore] as [number, number]
            : [aScore, bScore + 1] as [number, number]
        }, [0, 0] as [number, number])
      }

      static numericToStringScoreValue (numScore: [number, number]): string {
        const [aScore, bScore] = numScore
        if (aScore >= 3 && bScore >= 3) {
          if (aScore === bScore) return 'deuce'
          if (aScore < bScore) return 'Ad/40'
          return '40/Ad'
        }
        // [WIP] if game format is upTo more than 4, thent this doesn't work
        const strScoresList = ['0', '15', '30', '40']
        return `${strScoresList.at(aScore) ?? '?'}/${strScoresList.at(bScore) ?? '?'}`
      }
      
      getScore (): string {
        return Game.numericToStringScoreValue(this.getNumericScore())
      }
      
      isFinished (): boolean {
        const { format } = this
        const { upTo, diffToWin } = format
        const [aScore, bScore] = this.getNumericScore()
        const maxScoreReached = Math.max(aScore, bScore) >= upTo
        const diffReached = Math.abs(aScore - bScore) >= diffToWin
        if (maxScoreReached && diffReached) return true
        return false
      }

      getWinner (): boolean | null {
        if (!this.isFinished()) return null
        const [aScore, bScore] = this.getNumericScore()
        return aScore > bScore
      }
    }

    /* * * * * * * * * * * * * * * * * * * * *
     * Set
     * * * * * * * * * * * * * * * * * * * * */

    export type SetFormat = {
      upTo: number
      diffToWin: number
      gamesFormat: GameFormat
      tieBreakAt: number | null
      tieBreakFormat: GameFormat
    }

    export class Set {
      private format: SetFormat
      private pointsSequence: PointDescriptor[] = []

      constructor (format: SetFormat) {
        this.format = format
      }

      add (point: PointDescriptor) {
        this.pointsSequence.push(point)
      }

      getGames (): Game[] {
        const { format } = this
        const { upTo, diffToWin, gamesFormat, tieBreakFormat, tieBreakAt } = format
        let aGames = 0
        let bGames = 0
        const games: Game[] = []
        const { pointsSequence } = this
        pointsSequence.forEach(point => {
          // Finished
          const maxGamesReached = Math.max(aGames, bGames) >= upTo
          const diffReached = Math.abs(aGames - bGames) >= diffToWin
          if (maxGamesReached && diffReached) return;
          // Create new game if needed
          const lastGameInList = games.at(-1)
          const lastGameIsFinished = lastGameInList?.isFinished()
          if (lastGameInList === undefined || lastGameIsFinished === true) {
            // [WIP] something does not work here
            // tie break gets triggered even if no tie break
            // is expected in the set
            const isTiebreak = aGames === bGames && aGames === tieBreakAt
            if (isTiebreak) games.push(new Game(tieBreakFormat))
            else games.push(new Game(gamesFormat))
          }
          // Add to current game
          const currentGame = games.at(-1)
          if (currentGame === undefined) throw 'Something went wrong, this should\'t be undefined'
          currentGame.add(point)
          const currentGameWinner = currentGame.getWinner()
          if (currentGameWinner === true) { aGames += 1 }
          if (currentGameWinner === false) { bGames += 1 }
        })
        return games
      }

      getNumericScore (): { games: [number, number], currentGame?: [number, number] } {
        const games = this.getGames()
        let aScore = 0
        let bScore = 0
        games.forEach(game => {
          const winner = game.getWinner()
          if (winner === true) { aScore ++ }
          if (winner === false) { bScore ++ }
        })
        const lastGame = games.at(-1)
        if (lastGame === undefined) return { games: [aScore, bScore] }
        if (lastGame.isFinished() === false) return {
          games: [aScore, bScore],
          currentGame: lastGame.getNumericScore()
        }
        return { games: [aScore, bScore] }
      }

      getScore () {
        const numericScore = this.getNumericScore()
        const { games, currentGame } = numericScore
        if (currentGame === undefined) return `${games.join('/')}`
        return `${games.join('/')} ${Game.numericToStringScoreValue(currentGame)}`
      }

      isFinished (): boolean {
        const { format } = this
        const { upTo, diffToWin, tieBreakAt } = format
        const [aScore, bScore] = this.getNumericScore().games
        const maxGamesReached = Math.max(aScore, bScore) >= upTo
        const diffReached = Math.abs(aScore - bScore) >= diffToWin
        const tieBreakBeenPlayed = tieBreakAt !== null &&  Math.max(aScore, bScore) > tieBreakAt
        return tieBreakBeenPlayed || maxGamesReached && diffReached
      }

      getWinner (): boolean | null {
        if (!this.isFinished()) return null
        const [aScore, bScore] = this.getNumericScore().games
        return aScore > bScore
      }
    }

    /* * * * * * * * * * * * * * * * * * * * *
     * Match
     * * * * * * * * * * * * * * * * * * * * */

    export type MatchFormat = {
      upTo: number
      setsFormat: SetFormat
      lastSetFormat: SetFormat
    }

    export class Match {
      private format: MatchFormat
      private pointsSequence: PointDescriptor[] = []

      constructor (format: MatchFormat) {
        this.format = format
      }

      add (point: PointDescriptor) {
        this.pointsSequence.push(point)
      }

      getSets (): Set[] {
        const { format } = this
        const { upTo, setsFormat, lastSetFormat } = format
        let aSets = 0
        let bSets = 0
        const sets: Set[] = []
        const { pointsSequence } = this
        pointsSequence.forEach(point => {
          // Finished
          const maxSetsReached = Math.max(aSets, bSets) >= upTo
          if (maxSetsReached) return;
          // Create new set if needed
          const lastSetInList = sets.at(-1)
          const lastSetIsFinished = lastSetInList?.isFinished()
          if (lastSetInList === undefined || lastSetIsFinished === true) {
            const isLastSet = aSets === bSets && aSets === upTo - 1
            if (isLastSet) sets.push(new Set(lastSetFormat))
            else sets.push(new Set(setsFormat))
          }
          // Add to current set
          const currentSet = sets.at(-1)
          if (currentSet === undefined) throw 'Something went wrong, this should\'t be undefined'
          currentSet.add(point)
          const currentSetWinner = currentSet.getWinner()
          if (currentSetWinner === true) { aSets += 1 }
          if (currentSetWinner === false) { bSets += 1 }
        })
        return sets
      }

      getNumericScore (): {
        sets: [number, number][],
        currentGame?: [number, number]
      } {
        const sets = this.getSets()
        const numericScore = {
          sets: [] as [number, number][],
          currentGame: undefined as [number, number] | undefined
        }
        sets.forEach(set => {
          const setNumericScore = set.getNumericScore()
          const { games, currentGame } = setNumericScore
          numericScore.sets.push(games)
          if (currentGame !== undefined) { numericScore.currentGame = currentGame }
        })
        return numericScore
      }

      getScore () {
        return this
          .getSets()
          .map(set => set.getScore())
          .join(' ')
      }

      isFinished (): boolean {
        const { format } = this
        const { upTo } = format
        const sets = this.getSets()
        let aSets = 0
        let bSets = 0
        sets.forEach(set => {
          const winner = set.getWinner()
          if (winner === true) { aSets ++ }
          if (winner === false) { bSets ++ }
        })
        return Math.max(aSets, bSets) >= upTo
      }

      getWinner (): boolean | null {
        if (!this.isFinished()) return null
        const sets = this.getSets()
        let aSets = 0
        let bSets = 0
        sets.forEach(set => {
          const winner = set.getWinner()
          if (winner === true) { aSets ++ }
          if (winner === false) { bSets ++ }
        })
        return aSets > bSets
      }
    }
  }
}
