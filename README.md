# ember-stateful

A simple mixin to provide finite state machine semantics to Ember Components and Services.

## Installation

```bash
ember install ember-stateful
```

## Usage

```js
// my-component.js
import Stateful from 'ember-stateful'

export default Ember.Component.extend(Stateful, {

  didInsertElement(...args) {
    this._super(...args);
    Ember.run.later(this, function() {
      this.send('turnOn', 'hello');
    }, 5000);
  },

  actions: {
    turnOn(msg) {
      console.log('argument to turnOn is', msg);
      this.transitionTo('on');
    },
    on: {
      _try() { alert('i am entering the on state'); },
      _finally() { alert('i am exiting the on state'); },
      turnOff() {
        this.transitionTo('off');
      },
      turnOn() {
        alert('turning on while in on state does nothing useful');
        return true; // makes the action bubble to the parent state
      },
      idle: {
        _default: true,
        _try() { alert('i am entering the on.idle state'); },
        _finally() { alert('i am exiting the on.idle state'); },
        toggle() {
          this.transitionTo('on.active');
        }
      },
      active: {
        toggle() {
          this.transitionTo('on.idle');
        }
      }
    }
  }
});
```

```hbs
{{! my-component.hbs }}

{{! the value of the `currentState` property can be e.g. `'off'` or `'on.idle'` }}
Current state is {{currentState}}
<br>
{{! the value of the `state` property can  be e.g. `{off: {}}` or `{on: {idle: {}}}` }}
{{#if state.off}}
  <button onclick={{action "turnOn"}}>Turn On</button>
{{else if state.on}}
  <button onclick={{action "turnOff"}}>Turn Off</button>
  <br>
  <button onclick={{action "toggle"}}>Toggle On State</button>
  <br>
{{/if}}
```

For a more sophisticated usage example check out the
component backed by a stateful service in the dummy app.

## Why

The Mixin provided by this addon is intended to simplify the state management logic for Components and Services.
It makes use of the `actions` hash allowing for a smooth adoption inside Components.
It also works well with Services, since these are often already intended to hold state,
and you will be familiar with `actions` hash and `send` semantics from Components.
The `_try` and `_finally` actions provide a place to perform default tasks when
entering and exiting (sub-)states.

This Mixin should not be used in Routes since it overrides the behaviour of `send`.
It was not intended to be used in Routes in the first place,
since the Router already represents a Finite State Machine
where the individual Routes are states and actions are allowed to bubble to parent states.
