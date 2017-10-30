import Ember from 'ember';
import Stateful from 'ember-stateful';

const { Logger: { log } } = Ember;

/**

State Transition Diagram. Dotted lines indicate an asynchronous transition

    +-----------------------------------------------+
    | offline                                       |
    |                                               |
    | +--------------+    connect    +------------+ |
    | |              +--------------->            | |
    +-> disconnected |               | connecting | |
    | |              <---------------+            | |
    | +--------------+ cancelConnect +----^-+-----+ |
    |                                     | :       |
    +---^--^------------------------------|-:-------+
        :  |                              | :
        :  |lostConnection  lostConnection| :_enter
        :  |                              | :
+-------:--|--+------------+--------------+-v-----------+
|       :  |  |            |                     online |
| _enter:  |  |disconnect  |sync                        |
|       :  |  |            |                            |
| +-----+--+--v---+   +----v----+        +-----------+  |
| |               |   |         |        |           |  |
| | disconnecting |   | syncing +........> connected <--+
| |               |   |         | _enter |           |  |
| +---------------+   +---------+        +-----------+  |
|                                                       |
+-------------------------------------------------------+
 */

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
        log('entering state offline');
      },
      _exit() {
        log('exiting state offline');
      },
      disconnected: {
        _enter() {
          log('entering state offline.disconnected');
        },
        _exit() {
          log('exiting state offline.disconnected');
        },
        connect() {
          log('connect')
          this.transitionTo('offline.connecting');
        },
      },
      connecting: {
        _enter() {
          log('entering state offline.connecting');
          log('starting connection');
          this.set('connectTimer', Ember.run.later(this, 'transitionTo', 'online', 1000));
        },
        _exit() {
          log('exiting state offline.connecting');
          Ember.run.cancel(this.get('connectTimer'));
        },
        cancelConnect() {
          log('cancelling connection')
          this.transitionTo('offline.disconnected');
        },
      },
    },
    online: {
      _enter() {
        log('entering state online');
      },
      _exit() {
        log('exiting state online');
        Ember.run.cancel(this.get('syncTimer'));
      },
      disconnect() {
        log('disconnecting');
        this.transitionTo('online.disconnecting');
      },
      sync() {
        log('starting sync');
        this.transitionTo('online.syncing');
      },
      lostConnection() {
        log('lost connection');
        this.transitionTo('offline.connecting');
      },
      connected: {
        _enter() {
          log('entering state online.connected');
        },
        _exit() {
          log('exiting state online.connected');
        },
      },
      syncing: {
        _enter() {
          log('entering state online.syncing');
          this.set('syncTimer', Ember.run.later(this, function() {
            log('finished sync');
            this.transitionTo('online.connected');
          }, 1000));
        },
        _exit() {
          log('exiting state online.syncing');
        },
      },
      disconnecting: {
        _enter() {
          log('entering state online.disconnecting');
          Ember.run.later(this, function() {
            this.transitionTo('offline');
          }, 500);
        },
        _exit() {
          log('exiting state online.disconnecting');
        },
        lostConnection() {
          log('lost connection');
          this.transitionTo('offline');
        },
      },
    },
  },
});
