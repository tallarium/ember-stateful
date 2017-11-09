import * as utils from 'ember-stateful/mixins/-stateful-utils';
import { module, test } from 'qunit';

module('Unit | Mixin | stateful utils');

test('finds youngest common state ancestor', function(assert) {
  let result = utils.findYoungestCommonAncestor('A.B.C', 'A.X.Y')
  assert.equal(result, 'A');
});

test('returns _root if no common ancestor', function(assert) {
  let result = utils.findYoungestCommonAncestor('A.B.C', 'Z.X.Y')
  assert.equal(result, '_root');
});
