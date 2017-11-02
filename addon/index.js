import Ember from 'ember';
import StatefulMixin from 'ember-stateful/mixins/stateful';

export function waitForEnterState(statefulObject, stateName) {
  return new Ember.RSVP.Promise((resolve) => {
    statefulObject.on('try', (eventStateName) => {
      if (eventStateName === stateName) {
        resolve();
      }
    })
  });
}

export default StatefulMixin;

