import Ember from 'ember';
import ERRORS from 'ember-stateful/errors';
import { module, test } from 'qunit';
import waitForEnterState from 'ember-stateful/utils/wait-for-enter-state';
import stateful from 'ember-stateful/utils/stateful';

module('Unit | Util | stateful');

// Replace this with your real tests.
test('it initializes correctly with empty actions hash', function(assert) {
  let StatefulObject = Ember.Object.extend(stateful({
    actions: {}
  }));
  let subject = StatefulObject.create();
  assert.ok(subject);
});

test('transitions to default state', function(assert) {
  let StatefulObject = Ember.Object.extend(stateful({
    actions: {
      A: {}
    }
  }));
  let subject = StatefulObject.create();
  assert.ok(subject.get('state.A'))
});

test('transitions to default state specified explicitly', function(assert) {
  let StatefulObject = Ember.Object.extend(stateful({
    actions: {
      A: {},
      B: {
        _default: true,
      }
    }
  }));
  let subject = StatefulObject.create();
  assert.ok(subject.get('state.B'))
});

test('throws if default substate neither obvious nor specified explicitly', function(assert) {
  const decorate = () => stateful({
    actions: {
      A: {},
      B: {},
    }
  });
  assert.throws(decorate, ERRORS.DEFAULT_SUBSTATE_NOT_DEFINED('_root'));
});

test('transitions to a different state', async function(assert) {
  let StatefulObject = Ember.Object.extend(stateful({
    actions: {
      A: {
        _default: true,
      },
      B: {},
    }
  }));
  let subject = StatefulObject.create();
  await subject.transitionTo('B');
  assert.ok(subject.get('state.B'));
  assert.equal(subject.get('_state_A.isRunning'), false);
});

test('calls hooks in the proper order', async function(assert) {
  const arr = [];
  const pushToArr = (arg) => () => arr.push(arg);
  let StatefulObject = Ember.Object.extend(stateful({
    actions: {
      A: {
        _default: true,
        _try: pushToArr('A.try'),
        _finally: pushToArr('A.finally'),
        B: {
          _try: pushToArr('A.B.try'),
          _finally: pushToArr('A.B.finally'),
        },
      },
      X: {
        _try: pushToArr('X.try'),
      },
    }
  }));
  let subject = StatefulObject.create();

  await subject.transitionTo('X');

  assert.deepEqual(arr, [
    'A.try',
    'A.B.try',
    'A.B.finally',
    'A.finally',
    'X.try',
  ]);
});

test('fires events in the correct order', async function(assert) {
  const arr = [];
  const wait = () => new Ember.RSVP.Promise((resolve) => setTimeout(resolve, 0));
  let StatefulObject = Ember.Object.extend(stateful({
    actions: {
      A: {
        _default: true,
        _try: wait,
        B: {
          _try: wait,
        },
      },
      X: {
        _try: wait,
      },
    },
  }));
  let subject = StatefulObject.create();
  for (const eventName of ['try_A', 'finally_A', 'try_A.B', 'finally_A.B', 'try_X', 'finally_X']) {
    subject.on(eventName, () => arr.push(eventName));
  }

  await waitForEnterState(subject, 'A.B');
  arr.length = 0;

  await subject.transitionTo('X');
  await subject.transitionTo('A.B');

  assert.deepEqual(arr, [
    'finally_A.B',
    'finally_A',
    'try_X',
    'finally_X',
    'try_A',
    'try_A.B',
  ]);

});

test('triggers events on state enter and exit', async function(assert) {
  const arr = [];
  let StatefulObject = Ember.Object.extend(stateful({
    actions: {
      A: {
        _default: true,
        B: {},
      },
      X: {},
    }
  }));
  let subject = StatefulObject.create();
  for (const stateName of ['A', 'A.B', 'X']) {
    for (const eventName of ['try', 'finally'].map((hook => `${hook}_${stateName}`))) {
      subject.on(eventName, () => arr.push(eventName));
    }
  }
  await subject.transitionTo('X');

  assert.deepEqual(arr, [
    'finally_A.B',
    'finally_A',
    'try_X',
  ]);
});

test('throws error when transitioning to nonexistent state', function(assert) {
  let StatefulObject = Ember.Object.extend(stateful({
    actions: {
      A: {
        B: {},
      },
    }
  }));
  let subject = StatefulObject.create();
  assert.throws(() => subject.transitionTo('X'), ERRORS.NO_SUCH_STATE('X'));
});

test('waits for hook promises', function(assert) {
  let StatefulObject = Ember.Object.extend(stateful({
    actions: {
      A: {
        _default: true,
        _try: () => Ember.RSVP.defer().promise,
        B: {},
      },
      X: {},
    }
  }));
  let subject = StatefulObject.create();
  assert.ok(subject.get('state.A'));
  assert.notOk(subject.get('state.A.B'));
});

test('does not allow actions from other states', function (assert) {
  let StatefulObject = Ember.Object.extend(stateful({
    actions: {
      A: {
        _default: true,
        B: {},
      },
      X: {
        someAction() {},
      },
    }
  }));
  let subject = StatefulObject.create();
  assert.throws(() => subject.send('someAction'), ERRORS.NO_ROOT_ACTION('someAction', subject));
});

test('bubbles actions up if they return true', function (assert) {
  const arr = [];
  let StatefulObject = Ember.Object.extend(stateful({
    actions: {
      someAction(){
        arr.push('root');
      },
      A: {
        someAction() {
          arr.push('A');
          return true;
        },
        B: {
          someAction() {
            arr.push('B');
            return true;
          },
        },
      },
    },
  }));
  let subject = StatefulObject.create();
  subject.send('someAction');
  assert.deepEqual(arr, [
    'B',
    'A',
    'root',
  ]);
});

test('does not bubble actions if they don\'t return true', function (assert) {
  const arr = [];
  let StatefulObject = Ember.Object.extend(stateful({
    actions: {
      someAction(){
        arr.push('root');
      },
      A: {
        someAction() {
          arr.push('A');
        },
        B: {
          someAction() {
            arr.push('B');
          },
        },
      },
    },
  }));
  let subject = StatefulObject.create();
  subject.send('someAction');
  assert.deepEqual(arr, [
    'B',
  ]);
});

test('all actions from the state machine exist in the actions hash', function (assert) {
  let StatefulObject = Ember.Object.extend(stateful({
    actions: {
      action1: function() {},
      A: {
        _default: true,
        action2: function() {},
        B: {
          action3: function() {},
        },
      },
      X: {
        action4: function() {},
      },
    }
  }));
  let subject = StatefulObject.create();
  for (const actionName of ['action1', 'action2', 'action3', 'action4']){
    const action = subject.actions[actionName];
    assert.equal(typeof(action), 'function');
  }
});

test('does nothing if trying to transition to state we\'re already in', function(assert) {
  let StatefulObject = Ember.Object.extend(stateful({
    actions: {
      A: {
        _default: true,
        B: {
          _finally: () => assert.ok(false, 'should not execute this')
        },
      },
    }
  }));
  let subject = StatefulObject.create();

  subject.transitionTo('A');
  assert.ok(true, 'success');
});
