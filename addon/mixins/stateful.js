import Ember from 'ember';
import ERRORS from 'ember-stateful/errors';
import * as utils from './-stateful-utils';

const { computed } = Ember;


export default Ember.Mixin.create(Ember.Evented, {
  /**
   * If the current State is 'a.b.c', this property is `{ a: { b: { c: {}}}}`
   * The idea is to simplify state checks, e.g.
   * `if (this.get('state.a.b')) { ... }` will work in state 'a.b.c' and 'a.b.d',
   * epsecially for templates.
   *
   * @property {Object} state
   */
  state: computed('currentState', function() {
    const ret = this.get('currentState').split('.').reduceRight((acc, s) => {
      return { [s]: acc };
    }, {});
    return ret;
  }),

  _stateTaskNames: computed(function () {
    return Object.keys(this)
      .filter(utils.isStateTaskName)
      .map(key => ({
        key,
        val: this.get(key),
      }))
      .map(x => x.key)
      .map(x => (x === '_state_root' ? '_state' : x)) // state_root is actually the topmost state
      .map(x => x.split('_'))
      .sort((x, y) => x.length < y.length)
      .map(x => x.join('_'))
      .map(x => (x === '_state' ? '_state_root' : x)); // bring back proper name for state_root
  }),

  _stateNames: computed('_stateTaskNames', function() {
    const stateTaskNames = this.get('_stateTaskNames');
    return stateTaskNames.map(utils.getStateNameFromStateTaskName);
  }),

  _defaultStateMapping: undefined,

  init(...args) {
    this._super(...args);
    utils.initializeStateHierarchy(this);
    this._getStateTask('_root').perform(true);
    const stateTaskNames = this.get('_stateTaskNames') ;
    Object.defineProperty(this, 'currentState', {
      value: computed(...stateTaskNames.map(stateTask => `${stateTask}.isRunning`), function() {
        const stateTaskNames = this.get('_stateTaskNames');
        const runningStateTaskName = stateTaskNames.find(
          stateTaskName => this.get(`${stateTaskName}.isRunning`)
        );
        if (!runningStateTaskName) {
          throw new Error(ERRORS.NO_RUNNING_STATE());
        }
        return utils.getStateNameFromStateTaskName(runningStateTaskName);
      }),
    });
    // kick off the computed properties
    this.get('state');
    this.get('currentState');
  },

  send(actionName, ...args) {
    let stateParts = this.get('currentState').split('.');
    let shouldBubble = true;

    while(shouldBubble && stateParts.length > 0) {
      const action = this.get(`actions._root.${stateParts.join('.')}.${actionName}`);
      if (action) {
        shouldBubble = action.apply(this, args) === true;
      }
      stateParts.pop();
    }
    if (shouldBubble) {
      const rootAction = this.actions._root[actionName];
      if (!rootAction) {
        throw new Error(ERRORS.NO_ROOT_ACTION(actionName, this));
      }
      rootAction.apply(this, args);
    }
  },

  transitionTo(stateName) {
    if (!this._checkIfStateExists(stateName)) {
      throw new Error(ERRORS.NO_SUCH_STATE(stateName));
    }
    const currentState = this.get('currentState');
    const ancestor = utils.findYoungestCommonAncestor(currentState, stateName);

    const currentStateParts = currentState.split('.');
    const ancestorParts = ancestor.split('.');

    let finishLevel = ancestorParts.length;
    if (ancestorParts[0] === '_root') {
      finishLevel--;
    }

    // iterate from deepest to shallowest state for cancelation
    for (let i = currentStateParts.length; i > finishLevel ; i--) {
      const state = currentStateParts.slice(0, i).join('.');
      const stateTask = this._getStateTask(state);
      stateTask.cancelAll();
    }

    this._getStateTask(stateName).perform(true);
  },


  _getStateTask(stateName) {
    return this.get(utils.getStateTaskName(stateName));
  },

  _getDefaultStateName(stateName) {
    return this._defaultStateMapping[stateName];
  },

  _checkIfStateExists(stateName) {
    const stateNames = this.get('_stateNames');
    return stateNames.includes(stateName);
  },
});
