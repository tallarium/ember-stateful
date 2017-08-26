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
      disconnected: {
        connect() {
          this.transitionTo('offline.connecting');
          this.set('connectTimer', Ember.run.later(this, 'transitionTo', 'online.connected', 1000));
        },
      },
      connecting: {
        cancelConnect() {
          Ember.run.cancel(this.get('connectTimer'));
          this.transitionTo('offline.disconnected');
        },
      },
    },
    online: {
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
        this.transitionTo('offline.connecting');
        this.send('connect');
      },
    }
  },
});
