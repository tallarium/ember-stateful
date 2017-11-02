import Ember from 'ember';
import StatefulMixin, { waitForEnterState } from 'ember-stateful';
import { timeout } from 'ember-concurrency';
import { module, test } from 'qunit';

module('Unit | waitForEnterState');

// Replace this with your real tests.
test('detects state enter', async function(assert) {
  let StatefulObject = Ember.Object.extend(StatefulMixin, {
    states: [],
    actions: {
      A: {
        _default: true,
        B: {},
      },
      X: {},
    }
  });
  let obj = StatefulObject.create();
  const waiting = waitForEnterState(obj, 'X');
  obj.transitionTo('X');
  // should resolve
  await waiting;
  assert.ok(true)
});

test('does not resolve if already in state', async function(assert) {
  let StatefulObject = Ember.Object.extend(StatefulMixin, {
    states: [],
    actions: {
      A: {
        _default: true,
        B: {},
      },
      X: {},
    }
  });
  let obj = StatefulObject.create();
  const timeoutFunc = async (ms) => { await timeout(ms); return 'timeout' };
  const result = await Ember.RSVP.race([
    waitForEnterState(obj, 'B'),
    timeoutFunc(1000),
  ])
  assert.equal(result, 'timeout');
});

