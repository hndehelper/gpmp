import { normalizeWord, validateStartingLetter, isKnownWord } from './dictionary.js';

export const CATEGORIES = [
  { id: 'girlName', labelEn: 'Girl Name', labelSi: 'ගෑනු ළමයා', icon: '👧' },
  { id: 'boyName', labelEn: 'Boy Name', labelSi: 'පිරිමි ළමයා', icon: '👦' },
  { id: 'flower', labelEn: 'Flower', labelSi: 'මල්', icon: '🌺' },
  { id: 'fruit', labelEn: 'Fruit', labelSi: 'පළතුරු', icon: '🍍' },
  { id: 'vegetable', labelEn: 'Vegetable', labelSi: 'එළවළු', icon: '🥦' },
  { id: 'villageCity', labelEn: 'Village / City', labelSi: 'ගම / නගරය', icon: '🏡' }
];

/**
 * Calculates scores for all players in a round.
 * @param {Object} playersAnswers - Map of playerId -> { girlName, boyName, flower, fruit, vegetable, villageCity }
 * @param {Array} playerList - Array of { id, name }
 * @param {string} roundLetter - Target letter (e.g. 'B')
 * @param {Object} manualOverrules - Map of `${playerId}_${categoryId}` -> boolean (true = valid, false = invalid)
 */
export function calculateRoundScores(playersAnswers, playerList, roundLetter, manualOverrules = {}) {
  const playerMap = new Map(playerList.map(p => [p.id, p.name]));
  
  // Structure: categoryId -> array of submissions
  const categoryResults = {};
  const playerRoundTotals = {};
  
  // Initialize player totals
  playerList.forEach(p => {
    playerRoundTotals[p.id] = {
      score: 0,
      uniqueCount: 0,
      duplicateCount: 0,
      invalidCount: 0,
      breakdown: {}
    };
  });

  CATEGORIES.forEach(cat => {
    const catId = cat.id;
    const answerGroups = new Map(); // normalizedWord -> array of { playerId, rawAnswer }
    const playerCategoryStatus = {};

    // 1. Gather and check basic letter validity
    playerList.forEach(p => {
      const pId = p.id;
      const rawAnswer = (playersAnswers[pId] && playersAnswers[pId][catId]) ? playersAnswers[pId][catId].trim() : "";
      const overruleKey = `${pId}_${catId}`;
      const hasOverrule = manualOverrules.hasOwnProperty(overruleKey);
      
      const startsWithLetter = validateStartingLetter(rawAnswer, roundLetter);
      const isKnown = isKnownWord(catId, rawAnswer);

      let isValid = false;
      if (hasOverrule) {
        isValid = manualOverrules[overruleKey];
      } else {
        // By default, if it starts with the designated letter and is non-empty, default to valid for players to peer review!
        isValid = startsWithLetter && rawAnswer.length > 0;
      }

      const normalized = normalizeWord(rawAnswer);

      playerCategoryStatus[pId] = {
        playerId: pId,
        playerName: playerMap.get(pId) || "Player",
        rawAnswer,
        normalized,
        isValid,
        startsWithLetter,
        isKnown,
        points: 0,
        status: isValid ? 'valid' : (rawAnswer.length === 0 ? 'empty' : 'invalid'),
        duplicatesWith: []
      };

      if (isValid && normalized.length > 0) {
        if (!answerGroups.has(normalized)) {
          answerGroups.set(normalized, []);
        }
        answerGroups.get(normalized).push(pId);
      }
    });

    // 2. Score calculation: Unique vs Duplicates
    answerGroups.forEach((playerIds, normWord) => {
      const count = playerIds.length;
      if (count === 1) {
        // Unique answer -> 10 points
        const pId = playerIds[0];
        playerCategoryStatus[pId].points = 10;
        playerCategoryStatus[pId].status = 'unique';
      } else {
        // Duplicate answer -> 10 / count points each
        const pointsPerPlayer = Math.round((10 / count) * 10) / 10;
        playerIds.forEach(pId => {
          playerCategoryStatus[pId].points = pointsPerPlayer;
          playerCategoryStatus[pId].status = 'duplicate';
          playerCategoryStatus[pId].duplicateCount = count;
          playerCategoryStatus[pId].duplicatesWith = playerIds
            .filter(otherId => otherId !== pId)
            .map(otherId => playerMap.get(otherId) || "Player");
        });
      }
    });

    // 3. Accumulate totals
    playerList.forEach(p => {
      const stat = playerCategoryStatus[p.id];
      playerRoundTotals[p.id].score += stat.points;
      playerRoundTotals[p.id].breakdown[catId] = stat;
      
      if (stat.status === 'unique') playerRoundTotals[p.id].uniqueCount++;
      else if (stat.status === 'duplicate') playerRoundTotals[p.id].duplicateCount++;
      else playerRoundTotals[p.id].invalidCount++;
    });

    categoryResults[catId] = playerCategoryStatus;
  });

  return {
    categoryResults,
    playerRoundTotals
  };
}
