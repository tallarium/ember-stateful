import Ember from 'ember';
import StatefulMixin from 'ember-stateful/mixins/stateful';
import ERRORS from 'ember-stateful/errors';
import { module, test } from 'qunit';

module('Unit | Mixin | stateful');

// Replace this with your real tests.
test('it works', function(assert) {
  let StatefulObject = Ember.Object.extend(StatefulMixin, {
    actions: {}
  });
  let subject = StatefulObject.create();
  assert.ok(subject);
});

test('transitions to default state', function(assert) {
  let StatefulObject = Ember.Object.extend(StatefulMixin, {
    actions: {
      A: {}
    }
  });
  let subject = StatefulObject.create();
  assert.ok(subject.get('state.A'))
});

test('transitions to default state specified explicitly', function(assert) {
  let StatefulObject = Ember.Object.extend(StatefulMixin, {
    actions: {
      A: {},
      B: {
        _default: true,
      }
    }
  });
  let subject = StatefulObject.create();
  assert.ok(subject.get('state.B'))
});

test('throws if default substate not specified', function(assert) {
  let StatefulObject = Ember.Object.extend(StatefulMixin, {
    actions: {
      A: {},
      B: {},
    }
  });
  assert.throws(StatefulObject.create, ERRORS.DEFAULT_SUBSTATE_NOT_DEFINED('_root'));
});

test('transitions to a different state', function(assert) {
  let StatefulObject = Ember.Object.extend(StatefulMixin, {
    actions: {
      A: {
        _default: true,
      },
      B: {},
    }
  });
  let subject = StatefulObject.create();
  subject.transitionTo('B');
  assert.ok(subject.get('state.B'));
  assert.equal(subject.get('_state_A.isRunning'), false);
});

test('calls hooks in the proper order', function(assert) {
  const arr = [];
  const pushToArr = (arg) => () => arr.push(arg);
  let StatefulObject = Ember.Object.extend(StatefulMixin, {
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
  });
  let subject = StatefulObject.create();

  subject.transitionTo('X');

  assert.deepEqual(arr, [
    'A.try',
    'A.B.try',
    'A.finally',
    'A.B.finally',
    'X.try',
  ]);
});

test('triggers events on state enter and exit', function(assert) {
  const arr = [];
  let StatefulObject = Ember.Object.extend(StatefulMixin, {
    actions: {
      A: {
        _default: true,
        B: {},
      },
      X: {},
    }
  });
  let subject = StatefulObject.create();
  subject.on('try', (stateName) => arr.push(`${stateName}.try`));
  subject.on('finally', (stateName) => arr.push(`${stateName}.finally`));

  subject.transitionTo('X');

  assert.deepEqual(arr, [
    'A.finally',
    'A.B.finally',
    'X.try',
  ]);
});

test('throws error when transitioning to nonexistent state', function(assert) {
  let StatefulObject = Ember.Object.extend(StatefulMixin, {
    actions: {
      A: {
        B: {},
      },
    }
  });
  let subject = StatefulObject.create();
  assert.throws(() => subject.transitionTo('X'), ERRORS.NO_SUCH_STATE('X'));
});
test('waits for hook promises', function(assert) {
  let StatefulObject = Ember.Object.extend(StatefulMixin, {
    actions: {
      A: {
        _default: true,
        _try: () => Ember.RSVP.defer().promise,
        B: {},
      },
      X: {},
    }
  });
  let subject = StatefulObject.create();
  assert.ok(subject.get('state.A'));
  assert.notOk(subject.get('state.A.B'));
});
