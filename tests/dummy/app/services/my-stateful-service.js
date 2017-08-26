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
          console.log('connect')
          this.transitionTo('offline.connecting');
        },
      },
      connecting: {
        _enter() {
          console.log('entering state offline.connecting');
          console.log('starting connection');
          this.set('connectTimer', Ember.run.later(this, 'transitionTo', 'online.connected', 1000));
        },
        _exit() {
          console.log('exiting state offline.connecting');
          Ember.run.cancel(this.get('connectTimer'));
        },
        cancelConnect() {
          console.log('cancelling connection')
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
        Ember.run.cancel(this.get('syncTimer'));
      },
      disconnect() {
        console.log('disconnecting');
        this.transitionTo('offline');
      },
      sync() {
        console.log('starting sync');
        this.transitionTo('online.syncing');
      },
      lostConnection() {
        console.log('lost connection');
        this.transitionTo('offline.connecting');
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
          this.set('syncTimer', Ember.run.later(this, function() {
            console.log('finished sync');
            this.transitionTo('online.connected');
          }, 1000));
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
