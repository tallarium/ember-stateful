import Ember from 'ember';
import Stateful from 'ember-stateful';

export default Ember.Service.extend(Stateful, {

  states: [
    'offline.disconnected',
    'offline.connecting',
    'online.connected',
    'online.syncing',
    'online.disconnecting',
  ],

  actions: {
    offline: {
      _enter() {
        console.log('entering state offline');
      },
      _exit() {
        console.log('exiting state offline');
      },
      disconnected: {
        _enter() {
          console.log('entering state offline.disconnected');
        },
        _exit() {
          console.log('exiting state offline.disconnected');
        },
        connect() {
          this.transitionTo('offline.connecting');
          this.set('connectTimer', Ember.run.later(this, 'transitionTo', 'online.connected', 1000));
        },
      },
      connecting: {
        _enter() {
          console.log('entering state offline.connecting');
        },
        _exit() {
          console.log('exiting state offline.connecting');
        },
        cancelConnect() {
          Ember.run.cancel(this.get('connectTimer'));
          this.transitionTo('offline.disconnected');
        },
      },
    },
    online: {
      _enter() {
        console.log('entering state online');
      },
      _exit() {
        console.log('exiting state online');
      },
      disconnect() {
        console.log('disconnecting');
        Ember.run.cancel(this.get('syncTimer'));
        this.transitionTo('offline');
      },
      sync() {
        console.log('starting sync');
        this.transitionTo('online.syncing');
        this.set('syncTimer', Ember.run.later(this, function() {
          console.log('finished sync');
          this.transitionTo('online.connected');
        }, 1000));
      },
      lostConnection() {
        console.log('lost connection');
        Ember.run.cancel(this.get('syncTimer'));
        this.transitionTo('offline');
        this.send('connect');
      },
      connected: {
        _enter() {
          console.log('entering state online.connected');
        },
        _exit() {
          console.log('exiting state online.connected');
        },
      },
      syncing: {
        _enter() {
          console.log('entering state online.syncing');
        },
        _exit() {
          console.log('exiting state online.syncing');
        },
      },
      disconnecting: {
        _enter() {
          console.log('entering state online.disconnecting');
        },
        _exit() {
          console.log('exiting state online.disconnecting');
        },
      },
    }
  },
});
