const get = (lens, obj) => lens.get(obj)
const set = (lens, val, obj) => lens.set(val, obj)
const _set = (args, val, obj) => 
    !args.length ? val : ({...obj, [args[0]]: _set(args.slice(1), val, obj[args[0]])})
const path = (...args) => ({
    get: (obj) => args.reduce((result, key) => result[key], obj),
    set: (val, obj) => _set(args, val, obj)
})
module.exports = { set, get, path }

const assert = require('assert') // TEST
assert.equal(get(path('a'), { a: 4 }), 4) // TEST
assert.deepEqual(set(path('a'), 2, { a: 4 }), { a: 2 }) // TEST
assert.equal(get(path('a', 'b', 'c'), { a: { b: { c: 4 }}}), 4) // TEST
assert.deepEqual(set(path('a', 'b', 'c'), 2, { a: { b: { c: 4 }}}), { a: { b: { c: 2 }}}) // TEST
