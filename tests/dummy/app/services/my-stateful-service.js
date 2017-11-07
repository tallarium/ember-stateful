import Ember from 'ember';
import Stateful from 'ember-stateful/mixins/stateful';

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
        :  |lostConnection  lostConnection| :_try
        :  |                              | :
+-------:--|--+------------+--------------+-v-----------+
|       :  |  |            |                     online |
| _try:  |  |disconnect  |sync                        |
|       :  |  |            |                            |
| +-----+--+--v---+   +----v----+        +-----------+  |
| |               |   |         |        |           |  |
| | disconnecting |   | syncing +........> connected <--+
| |               |   |         | _try |           |  |
| +---------------+   +---------+        +-----------+  |
|                                                       |
+-------------------------------------------------------+
 */

export default Ember.Service.extend(Stateful, {

  actions: {
    offline: {
      _default: true,
      *_try() {
        log('entering state offline');
      },
      _finally() {
        log('exiting state offline');
      },
      disconnected: {
        _default: true,
        *_try() {
          log('entering state offline.disconnected');
        },
        _finally() {
          log('exiting state offline.disconnected');
        },
        connect() {
          log('connect')
          this.transitionTo('offline.connecting');
        },
      },
      connecting: {
        _try() {
          log('entering state offline.connecting');
          log('starting connection');
          this.set('connectTimer', Ember.run.later(this, 'transitionTo', 'online', 1000));
        },
        _finally() {
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
      _try() {
        log('entering state online');
      },
      _finally() {
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
        _default: true,
        _try() {
          log('entering state online.connected');
        },
        _finally() {
          log('exiting state online.connected');
        },
      },
      syncing: {
        _try() {
          log('entering state online.syncing');
          this.set('syncTimer', Ember.run.later(this, function() {
            log('finished sync');
            this.transitionTo('online.connected');
          }, 1000));
        },
        _finally() {
          log('exiting state online.syncing');
        },
      },
      disconnecting: {
        _try() {
          log('entering state online.disconnecting');
          Ember.run.later(this, function() {
            this.transitionTo('offline');
          }, 500);
        },
        _finally() {
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
