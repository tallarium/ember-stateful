import Ember from 'ember';
import waitForState from 'ember-stateful/utils/wait-for-state';
import stateful from 'ember-stateful/utils/stateful';
import { timeout } from 'ember-concurrency';
import { module, test } from 'qunit';

module('Unit | Utility | wait for state');

const timeoutFunc = async (ms) => { await timeout(ms); return 'timeout' };

test('resolves immediately if already in state', async function(assert) {
  let StatefulObject = Ember.Object.extend(stateful({
    actions: {
      A: {
        B: {},
      },
    }
  }));
  let obj = StatefulObject.create();
  const waiting = waitForState(obj, 'A.B');
  // should resolve immediately
  const result = await Ember.RSVP.race([
    waiting,
    timeoutFunc(200),
  ]);
  assert.notEqual(result, 'timeout');
});

