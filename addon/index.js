import Ember from 'ember';

const { computed } = Ember;

/**
 * @see https://github.com/emberjs/ember.js/blob/v2.14.1/packages/ember-views/lib/mixins/action_support.js
 */
export default Ember.Mixin.create({

  /**
   * you need to override this
   */
  states: undefined,

  currentState: computed({
    get() {
      return this._defaultStateMapping[''];
    },
    set(key, value) {
      let targetState = value;
      do {
        value = targetState;
        targetState = this._defaultStateMapping[value];
      } while (!Ember.isNone(targetState) && targetState !== value)
      if (Ember.isNone(targetState)) {
        throw new Error(`Invalid state transition attempted. Unknown state: ${value}`);
      }
      return targetState;
    },
  }),

  /**
   * If the current State is 'a.b.c', this property is `{ a: { b: { c: {}}}}`
   * The idea is to simplify state checks, e.g.
   * `if (this.get('state.a.b')) { ... }` will work in state 'a.b.c' and 'a.b.d',
   * epsecially for templates.
   *
   * @property {Object} state
   */
  state: computed('currentState', function() {
    return this.get('currentState').split('.').reduceRight((acc, s) => {
      return { [s]: acc };
    }, {});
  }),

  _defaultStateMapping: undefined,

  init(...args) {
    this._super(...args);
    const states = this.get('states');
    // put some empty actions into the actions hash so components don't complain
    const newRootStateActions = {};
    const stateToDefaultStateMap = {};
    // process in reverse order, because default states will be listed first
    states.reverse().forEach(state => {
      let stateParts = state.split('.');
      if (Ember.isNone(stateToDefaultStateMap[state])) {
        stateToDefaultStateMap[state] = state;
        // if stateToDefaultStateMap[state] is already set, the consumer
        // used a redundant intermediate state
      }
      while(stateParts.length > 0) {
        const thisState = stateParts.join('.');
        const parentState = stateParts.slice(0, -1).join('.');
        // we don't use Ember.set here, because keys will contain periods
        stateToDefaultStateMap[parentState] = thisState;
        const partlyActionsHash = this.get(`actions.${thisState}`) || {};
        Object.keys(partlyActionsHash).forEach(actionName => {
          const maybeAction = partlyActionsHash[actionName];
          if (Ember.isNone(newRootStateActions[actionName])) {
            const rootAction = this.actions[actionName];
            if (Ember.isNone(rootAction)) {
              newRootStateActions[actionName] = function(...args) {
                throw new Error(`A root action named '${actionName}' was not found in ${this}`);
              }
            } else {
              newRootStateActions[actionName] = rootAction;
            }
            this.actions[actionName] = function(...args) {
              this.send(actionName, ...args);
            }
          }
        });
        stateParts.pop();
      }
    });
    this._defaultStateMapping = stateToDefaultStateMap;
    this.actions._root = newRootStateActions;
  },

  send(actionName, ...args) {

    let stateParts = this.get('currentState').split('.');
    let shouldBubble = true;

    while(shouldBubble && stateParts.length > 0) {
      const action = this.get(`actions.${stateParts.join('.')}.${actionName}`);
      if (action) {
        shouldBubble = action.apply(this, args) === true;
      }
      stateParts.pop();
    };
    if (shouldBubble) {
      this.actions._root[actionName].apply(this, args);
    }
  },

  transitionTo(state) {
    this.set('currentState', state);
  },
});
