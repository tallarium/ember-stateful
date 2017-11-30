import * as utils from 'ember-stateful/utils/-utils';
import { module, test } from 'qunit';

module('Unit | Util | utils');

test('finds youngest common state ancestor', function(assert) {
  let result = utils.findYoungestCommonAncestor('A.B.C', 'A.X.Y')
  assert.equal(result, 'A');
});

test('returns _root if no common ancestor', function(assert) {
  let result = utils.findYoungestCommonAncestor('A.B.C', 'Z.X.Y')
  assert.equal(result, '_root');
});

test('works if states are named similarly', function(assert) {
  let result = utils.findYoungestCommonAncestor('A.FooBaz', 'A.FooBar')
  assert.equal(result, 'A');
});
