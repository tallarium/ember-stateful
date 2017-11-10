import Ember from 'ember';
import Stateful from 'ember-stateful/mixins/stateful';

const { Logger: { log } } = Ember;

export default Ember.Component.extend(Stateful, {

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
      _try() {
        log('entering state on');
      },
      _finally() {
        log('exiting state on');
      },
      turnOn() {
        log('already on');
      },

      idle: {
        _try() {
          log('entering state on.idle');
        },
        _finally() {
          log('exiting state on.idle');
        },
        doStuff() {
          log('idling');
          log('becoming active');
          this.transitionTo('on.active');
        },
      },

      active: {
        _default: true,
        _try() {
          log('entering state on.active');
        },
        _finally() {
          log('exiting state on.active');
        },
        doStuff() {
          log('activity');
        },
      },
    },

    off: {
      _default: true,
      _try() {
        log('entering state off');
      },
      _finally() {
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
        _try() {
          log('entering state off.dead');
        },
        _finally() {
          log('exiting state off.dead');
        },
      },
    },
  },
});
