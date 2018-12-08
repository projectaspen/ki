/* globals describe, it */

const P2PTrust = require('../src/p2p-trust')
const assert = require('assert')

describe('jacobs algorithm', function () {
  it('should correctly retrieve degree for a neighbor', async function () {
    /*
      a
      |
      b
    */
    const p2pTrust = new P2PTrust()
    p2pTrust.setTrustClaim('a', 'b', 0.5)
    const trust = p2pTrust.getTrust('a', 'b')
    assert.strictEqual(trust.toString(), '0.5')
  })

  it('should correctly score a second-degree connection', async function () {
    /*
      a
      |
      b
      |
      c
    */
    const p2pTrust = new P2PTrust()
    p2pTrust.setTrustClaim('a', 'b', 0.5)
    p2pTrust.setTrustClaim('b', 'c', 0.5)
    const trust = p2pTrust.getTrust('a', 'c')
    assert.strictEqual(trust.toString(), '0.25')
  })

  it('should correctly take into account multiple paths', async function () {
    /*
        a
       / \
      b   c
       \ /
        d
    */
    const p2pTrust = new P2PTrust()
    p2pTrust.setTrustClaim('a', 'b', 0.5)
    p2pTrust.setTrustClaim('a', 'c', 0.5)
    p2pTrust.setTrustClaim('b', 'd', 0.5)
    p2pTrust.setTrustClaim('c', 'd', 0.5)
    const trust = p2pTrust.getTrust('a', 'd')
    assert.strictEqual(trust.toString(), '0.4375')
  })

  it('should return 1 when all trust links have confidence of 1', async function () {
    /*
        a
       / \
      b   c
       \ /
        d
        |
        e
    */
    const p2pTrust = new P2PTrust()
    p2pTrust.setTrustClaim('a', 'b', 1)
    p2pTrust.setTrustClaim('a', 'c', 1)
    p2pTrust.setTrustClaim('b', 'd', 1)
    p2pTrust.setTrustClaim('c', 'd', 1)
    p2pTrust.setTrustClaim('d', 'e', 1)
    const trust = p2pTrust.getTrust('a', 'e')
    assert.strictEqual(trust.toString(), '1')
  })

  it('should return 0 when there is no connecting path', async function () {
    const p2pTrust = new P2PTrust()
    p2pTrust.setTrustClaim('a', 'b', 1)
    p2pTrust.setTrustClaim('a', 'c', 1)
    p2pTrust.setTrustClaim('b', 'd', 1)
    p2pTrust.setTrustClaim('c', 'd', 1)
    p2pTrust.setTrustClaim('d', 'e', 1)
    const trust = p2pTrust.getTrust('a', 'f')
    assert.strictEqual(trust.toString(), '0')
  })

  it('should handle multiple confidence levels', async function () {
    /*
        a
       / \   <- 0.5
      b   c
       \ /   <- 0.25
        d
    */
    const p2pTrust = new P2PTrust()
    p2pTrust.setTrustClaim('a', 'b', 0.5)
    p2pTrust.setTrustClaim('a', 'c', 0.5)
    p2pTrust.setTrustClaim('b', 'd', 0.25)
    p2pTrust.setTrustClaim('c', 'd', 0.25)
    const trust = p2pTrust.getTrust('a', 'd')
    assert.strictEqual(trust.toString(), '0.234375')
  })

  it('should take indirect warnings into account', async function () {
    /*
      (* = warning claim)
        a
       / \   <- 0.5
      b   c
       \ *   <- 0.25
        d
    */
    const p2pTrust = new P2PTrust()
    p2pTrust.setTrustClaim('a', 'b', 0.5)
    p2pTrust.setTrustClaim('a', 'c', 0.5)
    p2pTrust.setTrustClaim('b', 'd', 0.25)
    p2pTrust.setWarningClaim('c', 'd', 0.25)
    const trust = p2pTrust.getTrust('a', 'd')
    assert.strictEqual(trust.toString(), '0.109375')
  })

  it('should take direct warnings into account', async function () {
    /*
      (* = warning claim; all edges 0.5 confidence)
        a
       / *
      b  *
       \ *
        c
    */
    const p2pTrust = new P2PTrust()
    p2pTrust.setTrustClaim('a', 'b', 0.5)
    p2pTrust.setTrustClaim('b', 'c', 0.5)
    p2pTrust.setWarningClaim('a', 'c', 0.5)
    const trust = p2pTrust.getTrust('a', 'c')
    assert.strictEqual(trust.toString(), '0.125')
  })
})
