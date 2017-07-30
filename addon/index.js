import Ember from 'ember';

const { computed } = Ember;

/**
 * @see https://github.com/emberjs/ember.js/blob/v2.14.1/packages/ember-views/lib/mixins/action_support.js
 */
export default Ember.Mixin.create({

  currentState: '',

  init(...args) {
    this._super(...args);
    const states = this.get('states');
    this.set('currentState', states[0]);
    // put some empty actions into the actions hash so components don't complain
    const newRootActions = {};
    states.forEach(state => {
      let stateParts = state.split('.');
      while(stateParts.length > 0) {
        const partlyActionsHash = this.get(`actions.${stateParts.join('.')}`); 
        Object.keys(partlyActionsHash).forEach(actionName => {
          const maybeAction = partlyActionsHash[actionName];
          if (Ember.isNone(newRootActions[actionName])) {
            const rootAction = this.actions[actionName];
            if (Ember.isNone(rootAction)) {
              newRootActions[actionName] = function(...args) {
                throw new Error(`A root action named '${actionName}' was not found in ${this}`);
              }
            } else {
              newRootActions[actionName] = rootAction;
            }
            this.actions[actionName] = function(...args) {
              this.send(actionName, ...args);
            }
          }
        });
        stateParts.pop();
      }
    });
    this.actions._root = newRootActions;
  },

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
    // todo check state?
    this.set('currentState', state);
  },
});
