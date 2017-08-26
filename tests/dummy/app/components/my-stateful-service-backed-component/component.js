import Ember from 'ember';

export default Ember.Component.extend({

  myStatefulService: Ember.inject.service(),

  state: Ember.computed.readOnly('myStatefulService.state'),

  actions: {
    connect() {
      this.get('myStatefulService').send('connect');
    },
    cancelConnect() {
      this.get('myStatefulService').send('cancelConnect');
    },
    disconnect() {
      this.get('myStatefulService').send('disconnect');
    },
    sync() {
      this.get('myStatefulService').send('sync');
    },
    looseConnection() {
      this.get('myStatefulService').send('lostConnection');
    },
  },
});
