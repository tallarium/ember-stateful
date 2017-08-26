import Ember from 'ember';
import Stateful from 'ember-stateful';

export default Ember.Component.extend(Stateful, {

  states: [
    'off',
    'on.active.dancing',
    'on.idle',
    'on.active.walking',
  ],

  actions: {

    doStuff(...args) {
      console.log('root action', ...args);
    },

    bang() {
      console.log('bang');
      this.send('doStuff', 'hello');
    },

    turnOn() {
      this.transitionTo('on.idle');
    },

    on: {
      turnOn() {
        console.log('already on');
      },

      idle: {
        doStuff() {
          console.log('idling');
          console.log('becoming active');
          this.transitionTo('on.active');
        },
      },

      active: {
        doStuff() {
          console.log('activity');
        },
      },
    },

    off: {
      turnOn() {
        console.log('turning on');
        return true;
      },

      doStuff(...args) {
        console.log('off action', ...args);
        return true;
      },
    },
  },
});
