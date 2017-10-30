import Ember from 'ember';
import StatefulMixin from 'ember-stateful/mixins/stateful';
import { module, test } from 'qunit';

module('Unit | Mixin | stateful');

// Replace this with your real tests.
test('it works', function(assert) {
  let StatefulObject = Ember.Object.extend(StatefulMixin, {
    states: [],
    actions: {}
  });
  let subject = StatefulObject.create();
  assert.ok(subject);
});
