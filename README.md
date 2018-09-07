## chepaillier-voting

A simple implementation of a voting system which preserve voters anonimity using homomorphic encryption (based on Paillier cryptosystem).

### Brief

Using homomorphic encryption we can create an encryption of a number using a `public key`, add encrypted numbers and get an encrypted result of the sum (that we can decrypt with a `private key`).

We can use this property to record voting preferences without exposing the selected votes.

### Usage

```js
const { mkBallot, vote, tally, decryptTally } = require('chepaillier-voting')

const [privateKey, ballot] = mkBallot('Where is the love?', ['Tokyo', 'London', 'Paris', 'Berlin'])
// Publish your ballot
// Protect your private key!

const nextBallot1 = vote(ballot, 'user-14341', 'Tokyo', 3)
const nextBallot2 = vote(nextBallot1, 'user-42345', 'London', 1)
// Record votes
// You can update votes multiple times for the same user

const encryptedTally = tally(nextBallot2)
const result = decryptTally(privateKey, encryptedTally)
/*{ Tokyo: <BigNum 3>,
    London: <BigNum 1>,
    Paris: <BigNum 0>,
    Berlin: <BigNum 0> }*/
```

### TODO
Add zero knowledge proof that the casted vote is one of N values.

### Tests
Tests live in the index file in the shape of a bunch of asserts.

Tests get removed automatically at `postinstall` using `sed`.

### License
MIT
