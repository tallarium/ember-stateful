import Ember from 'ember';
import ERRORS from 'ember-stateful/errors';

export default function waitForEnterState(statefulObject, stateName) {
  if (!statefulObject._checkIfStateExists(stateName)) {
    throw new Error(ERRORS.NO_SUCH_STATE(stateName));
  }
  return new Ember.RSVP.Promise((resolve) => {
    statefulObject.one(`try_${stateName}`, resolve);
  });
}

