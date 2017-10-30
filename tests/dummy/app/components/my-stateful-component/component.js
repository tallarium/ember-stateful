import Ember from 'ember';
import Stateful from 'ember-stateful';

const { Logger: { log } } = Ember;

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
        log('entering state off.dead');
      },
      _exit() {
        log('exiting state off.dead');
      },
    }
  },

  actions: {

    doStuff(...args) {
      log('root action', ...args);
    },

    bang() {
      log('bang');
      this.send('doStuff', 'hello');
    },

    turnOn() {
      this.transitionTo('on');
    },

    on: {
      _enter() {
        log('entering state on');
      },
      _exit() {
        log('exiting state on');
      },
      turnOn() {
        log('already on');
      },

      idle: {
        _enter() {
          log('entering state on.idle');
        },
        _exit() {
          log('exiting state on.idle');
        },
        doStuff() {
          log('idling');
          log('becoming active');
          this.transitionTo('on.active');
        },
      },

      active: {
        _enter() {
          log('entering state on.active');
        },
        _exit() {
          log('exiting state on.active');
        },
        doStuff() {
          log('activity');
        },
      },
    },

    off: {
      _enter() {
        log('entering state off');
      },
      _exit() {
        log('exiting state off');
      },
      turnOn() {
        log('turning on');
        return true;
      },

      doStuff(...args) {
        log('off action', ...args);
        return true;
      },

      dead: {
        _enter() {
          log('entering state off.dead');
        },
        _exit() {
          log('exiting state off.dead');
        },
      },
    },
  },
});
