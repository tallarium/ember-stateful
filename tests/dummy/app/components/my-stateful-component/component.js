import Ember from 'ember';
import Stateful from 'ember-stateful';

export default Ember.Component.extend(Stateful, {

  states: [
    'off',
    'on.idle',
    'on.active',
  ],

  actions: {

    on: {

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
        this.transitionTo('on.idle');
      },

      doStuff(...args) {
        console.log('off action', ...args);
        return true;
      },
    },

    doStuff(...args) {
      console.log('root action', args);
    },

    bang() {
      console.log('bang');
      this.send('doStuff', 'hello');
    },
  },
});
