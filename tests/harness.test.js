describe('harness', () => {
  it('eq compares deeply', () => { assert.eq({ a: [1, 2] }, { a: [1, 2] }); });
  it('throws detects errors', () => { assert.throws(() => { throw new Error('x'); }, /x/); });
  it('namespace exists', () => { assert.eq(LUM.config.teamSize, 4); });
});
