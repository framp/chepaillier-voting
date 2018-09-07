const paillier = require('paillier-bignum/src/paillier')
const assert = require('assert') // TEST
const { set, get, path } = require('./lens')

/*
Ballot = { 
    options: [Option], 
    voters: Map String Voter, 
    publicKey: PubKey, 
}
Voter = Map Option EncryptedVote
*/

// mkBallot :: String -> [Option] -> Number -> (PrivKey, Ballot)
const mkBallot = (name, options, numBits = 512) => {
    const { publicKey, privateKey } = paillier.generateRandomKeys(numBits)
    return [privateKey, {
        name,
        options,
        voters: {},
        publicKey,
    }]
}
const testBallot = mkBallot('Who\'s the best improvisator?', ['Jessica', 'Michael']) // TEST
assert.equal(testBallot[1].name, 'Who\'s the best improvisator?') // TEST
assert.deepEqual(testBallot[1].options, ['Jessica', 'Michael']) // TEST
assert(testBallot[0]) // TEST
assert(testBallot[1].publicKey) // TEST

// mkEmptyVoter :: PubKey -> Options -> Voter
const mkEmptyVoter = (publicKey, options) => 
    options.reduce((result, option) => 
        set(path(option), publicKey.encrypt(0), result), {})
const testEmptyVoter = mkEmptyVoter(testBallot[1].publicKey, testBallot[1].options) // TEST
assert(testEmptyVoter.Jessica > 0) // TEST
assert(testEmptyVoter.Michael > 0) // TEST
assert.equal(testBallot[0].decrypt(testEmptyVoter.Jessica).toNumber(), 0) // TEST

// vote :: Ballot -> VoterId -> Option -> Number -> Ballot
const vote = (ballot, voter, option, votes) => {
    const publicKey = ballot.publicKey
    const encryptedVotes = publicKey.encrypt(votes)
    const ballotWithVoter = (!get(path('voters', voter), ballot))
        ? set(path('voters', voter), mkEmptyVoter(publicKey, ballot.options), ballot)
        : ballot
    return set(path('voters', voter, option), encryptedVotes, ballotWithVoter)
}
const ballotWithVotes = vote(testBallot[1], 'framp', 'Jessica', 3) // TEST
assert(ballotWithVotes.voters.framp.Jessica) // TEST
assert(ballotWithVotes.voters.framp.Michael) // TEST
assert(!testBallot[1].voters.framp) // TEST
assert.equal(testBallot[0].decrypt(ballotWithVotes.voters.framp.Jessica).toNumber(), 3) // TEST
assert.equal(testBallot[0].decrypt(ballotWithVotes.voters.framp.Michael).toNumber(), 0) // TEST

// tally :: Ballot -> Map Option EncryptedVote
const tally = ({ publicKey, options, voters}) => {
    const zero = mkEmptyVoter(publicKey, options)
    const voterIds = Object.keys(voters)
    const mergeVotes = (voter1, voter2) => 
        Object.keys(voter1).reduce((result, option) => 
            set(path(option), publicKey.addition(voter1[option], voter2[option]), result), {})
    const encryptedResult = voterIds.reduce((result, voterId) => 
        mergeVotes(result, voters[voterId]), zero)
    return encryptedResult
}

// decryptTally :: PrivKey -> Map Option EncryptedVote
const decryptTally = (privateKey, encryptedResult) => {
    const result = Object.keys(encryptedResult).reduce((result, option) => 
        set(path(option), privateKey.decrypt(encryptedResult[option]), result), {})
    return result
}
const ballotWithVotes2 = vote(ballotWithVotes, 'marie', 'Jessica', 5) // TEST
const ballotWithVotes3 = vote(ballotWithVotes2, 'kate', 'Michael', 1) // TEST
const ballotWithVotes4 = vote(ballotWithVotes3, 'kate', 'Jessica', 10) // TEST
const ballotWithVotes5 = vote(ballotWithVotes4, 'kate', 'Jessica', 1) // TEST
const tallyResult = decryptTally(testBallot[0], tally(ballotWithVotes5)) // TEST
assert.equal(tallyResult.Jessica, 9) // TEST
assert.equal(tallyResult.Michael, 1) // TEST

module.exports = {
    mkBallot, vote, tally, decryptTally,
}
