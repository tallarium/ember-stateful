import Ember from 'ember';
import StatefulMixin from 'ember-stateful/mixins/stateful';
import ERRORS from 'ember-stateful/errors';

export function waitForEnterState(statefulObject, stateName) {
  if (!statefulObject.checkIfStateExists(stateName)) {
    throw new Error(ERRORS.NO_SUCH_STATE(stateName));
  }
  return new Ember.RSVP.Promise((resolve) => {
    statefulObject.one(`try_${stateName}`, resolve);
  });
}

export { ERRORS };
export default StatefulMixin;

