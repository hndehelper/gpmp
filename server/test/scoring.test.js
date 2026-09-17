import assert from 'assert';
import { calculateRoundScores, CATEGORIES } from '../src/ScoringEngine.js';
import { globalMetrics } from '../src/MetricsService.js';
import { validateStartingLetter, normalizeWord } from '../src/dictionary.js';

console.log('🧪 Running GPMP Engine Automated Verification Tests...\n');

// Test 1: Letter Validation
console.log('Test 1: Starting letter validation');
assert.strictEqual(validateStartingLetter('Bandakka', 'B'), true);
assert.strictEqual(validateStartingLetter('bandakka', 'b'), true);
assert.strictEqual(validateStartingLetter('Carrot', 'B'), false);
assert.strictEqual(validateStartingLetter('', 'B'), false);
console.log('✅ Passed Test 1: Letter Validation');

// Test 2: Word Normalization
console.log('Test 2: Normalization');
assert.strictEqual(normalizeWord('  Bandarawela  '), 'bandarawela');
assert.strictEqual(normalizeWord('Rose-Apple!'), 'roseapple');
console.log('✅ Passed Test 2: Word Normalization');

// Test 3: Scoring - Unique Answer = 10 pts, Duplicate Split = 5 pts
console.log('Test 3: Unique vs Duplicate Split Scoring');
const players = [
  { id: 'p1', name: 'Kasun' },
  { id: 'p2', name: 'Amal' },
  { id: 'p3', name: 'Nimal' }
];

const answers = {
  p1: {
    girlName: 'Bavani', // unique
    boyName: 'Bhanuka', // duplicate with p2
    flower: 'Bovitiya', // unique
    fruit: 'Banana',    // duplicate with p2 and p3 (3 players)
    vegetable: 'Bandakka', // unique
    villageCity: 'Badulla' // unique
  },
  p2: {
    girlName: 'Bhagya',  // unique
    boyName: 'Bhanuka', // duplicate with p1 (2 players)
    flower: 'Begonia',  // unique
    fruit: 'Banana',    // duplicate with p1 and p3 (3 players)
    vegetable: 'Bonchi',// unique
    villageCity: 'Biyagama' // unique
  },
  p3: {
    girlName: 'Binuki', // unique
    boyName: 'Brian',   // unique
    flower: 'Balsam',   // unique
    fruit: 'Banana',    // duplicate with p1 and p2 (3 players)
    vegetable: 'Batu',  // unique
    villageCity: 'Bandarawela' // unique
  }
};

const scores = calculateRoundScores(answers, players, 'B');

// Check p1 boyName: duplicated with p2 -> 10 / 2 = 5 points
const p1Boy = scores.categoryResults.boyName.p1;
assert.strictEqual(p1Boy.status, 'duplicate');
assert.strictEqual(p1Boy.points, 5);
assert.strictEqual(p1Boy.duplicateCount, 2);

// Check p1 fruit: duplicated with p2 and p3 -> 10 / 3 = 3.3 points
const p1Fruit = scores.categoryResults.fruit.p1;
assert.strictEqual(p1Fruit.status, 'duplicate');
assert.strictEqual(p1Fruit.points, 3.3);
assert.strictEqual(p1Fruit.duplicateCount, 3);

// Check p1 girlName: unique -> 10 points
const p1Girl = scores.categoryResults.girlName.p1;
assert.strictEqual(p1Girl.status, 'unique');
assert.strictEqual(p1Girl.points, 10);

console.log('✅ Passed Test 3: Unique (10 pts) and Duplicate Split (5 pts, 3.3 pts) calculations');

// Test 4: Manual Overrule
console.log('Test 4: Manual Overrule system');
const overrules = {
  'p1_girlName': false // manually mark Bavani invalid
};
const overruledScores = calculateRoundScores(answers, players, 'B', overrules);
assert.strictEqual(overruledScores.categoryResults.girlName.p1.isValid, false);
assert.strictEqual(overruledScores.categoryResults.girlName.p1.points, 0);
console.log('✅ Passed Test 4: Manual Overrule updates points to 0');

// Test 5: Global Metrics Service
console.log('Test 5: Global Metrics live stats tracking');
const initialRounds = globalMetrics.getGlobalStats().totalRoundsPlayed;
globalMetrics.incrementRound();
const newRounds = globalMetrics.getGlobalStats().totalRoundsPlayed;
assert.strictEqual(newRounds, initialRounds + 1);

globalMetrics.userConnected();
assert.ok(globalMetrics.getGlobalStats().liveOnlineUsers >= 1);
console.log('✅ Passed Test 5: Global Metrics counter successfully tracked');

console.log('\n🎉 ALL GPMP ENGINE UNIT TESTS PASSED SUCCESSFULLY!');
