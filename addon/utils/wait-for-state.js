import Ember from 'ember';
import waitForEnterState from 'ember-stateful/utils/wait-for-enter-state'

export default function waitForState(statefulObject, stateName) {
  if (statefulObject.get(`state.${stateName}`)) {
    return Ember.RSVP.resolve();
  }
  return waitForEnterState(statefulObject, stateName);
}
