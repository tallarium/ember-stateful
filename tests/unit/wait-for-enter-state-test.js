import Ember from 'ember';
import StatefulMixin, { waitForEnterState, ERRORS } from 'ember-stateful';
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
    waitForEnterState(obj, 'A.B'),
    timeoutFunc(200),
  ])
  assert.equal(result, 'timeout');

});

test('throws if state does not exist', async function(assert) {
  let StatefulObject = Ember.Object.extend(StatefulMixin, {
    states: [],
    actions: {
      A: {
        B: {},
      },
    }
  });
  const obj = StatefulObject.create();
  try {
    await waitForEnterState(obj, 'tommy');
    assert.ok(false);
  } catch (e) {
    assert.equal(e.message, ERRORS.NO_SUCH_STATE('tommy'));
  }
});
