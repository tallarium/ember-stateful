import Ember from 'ember';
import Stateful from 'ember-stateful';

export default Ember.Component.extend(Stateful, {

  states: [
    'off.dead',
    'on.active.dancing',
    'on.idle',
    'on.active.walking',
  ],

  off: {

    dead: {
      _enter() {
        console.log('entering state off.dead');
      },
      _exit() {
        console.log('exiting state off.dead');
      },
    }
  },

  actions: {

    doStuff(...args) {
      console.log('root action', ...args);
    },

    bang() {
      console.log('bang');
      this.send('doStuff', 'hello');
    },

    turnOn() {
      this.transitionTo('on');
    },

    on: {
      _enter() {
        console.log('entering state on');
      },
      _exit() {
        console.log('exiting state on');
      },
      turnOn() {
        console.log('already on');
      },

      idle: {
        _enter() {
          console.log('entering state on.idle');
        },
        _exit() {
          console.log('exiting state on.idle');
        },
        doStuff() {
          console.log('idling');
          console.log('becoming active');
          this.transitionTo('on.active');
        },
      },

      active: {
        _enter() {
          console.log('entering state on.active');
        },
        _exit() {
          console.log('exiting state on.active');
        },
        doStuff() {
          console.log('activity');
        },
      },
    },

    off: {
      _enter() {
        console.log('entering state off');
      },
      _exit() {
        console.log('exiting state off');
      },
      turnOn() {
        console.log('turning on');
        return true;
      },

      doStuff(...args) {
        console.log('off action', ...args);
        return true;
      },

      dead: {
        _enter() {
          console.log('entering state off.dead');
        },
        _exit() {
          console.log('exiting state off.dead');
        },
      },
    },
  },
});
