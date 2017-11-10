import Ember from 'ember';
import { task } from 'ember-concurrency';
import ERRORS from 'ember-stateful/errors';

const WAIT_HERE_FOREVER = Ember.RSVP.defer().promise;

function isThenable(obj) {
  return obj && typeof(obj.then) === 'function';
}

function executeStateHook(target, hook, ...args) {
  let ret;
  if (hook) {
    ret = hook.call(target, ...args);
  }
  if (!isThenable(ret)) {
    ret = Ember.RSVP.resolve();
  }
  return ret;
}

function isReservedProperty(name) {
  return ['_try', '_catch', '_finally', '_default'].includes(name)
}

function isStateHash(name, obj) {
  return !isReservedProperty(name) && typeof(obj) !== 'function';
}

function isAction(name, obj) {
  return !isReservedProperty(name) && typeof(obj) === 'function';
}

function getSuperStateName(stateName) {
  if (stateName === '_root') {
    return null;
  }
  if (!stateName.includes('.')) {
    return '_root';
  }
  return stateName.split('.').slice(0, -1).join('.');
}

export function getStateTaskName(stateName) {
  if (stateName === '_root') {
    return '_state_root';
  }
  return `_state_${stateName.split('.').join('_')}`;
}

export function isStateTaskName(name) {
  return name.startsWith('_state_');
}

function findSubStates(stateHash) {
  return Object.entries(stateHash).filter(([name, val]) => isStateHash(name, val));
}

function findDefaultSubState([stateName, stateHash]) {
  const subStates = findSubStates(stateHash);
  if (subStates.length === 0) {
    return null;
  }
  if (subStates.length === 1) {
    const [subState] = subStates;
    return subState;
  }
  const defaultSubStates = subStates
    .filter(([, hash]) => hash._default === true)
  if (defaultSubStates.length === 0) {
    throw new Error(ERRORS.DEFAULT_SUBSTATE_NOT_DEFINED(stateName))
  }
  if (defaultSubStates.length > 1) {
    throw new Error(ERRORS.MULTIPLE_DEFAULT_SUBSTATES(stateName, defaultSubStates));
  }
  const [defaultSubState] = defaultSubStates;
  return defaultSubState;
}

function getFullStateName(stateName, fullSuperStateName) {
  return fullSuperStateName === '_root'
    ? stateName
    : [fullSuperStateName, stateName].join('.');
}

export function getStateNameFromStateTaskName(stateTaskName) {
  if (stateTaskName.endsWith('_root')){
    return '_root';
  }
  const [, state] = stateTaskName.match(/^_state_(\w+)/);
  return state.split('_').join('.');
}

function initializeState(target, stateHash, stateName, fullSuperStateName) {
  // initialize
  const fullStateName = getFullStateName(stateName, fullSuperStateName);

  // create the state task
  let stateTask = task(function*(...args){
    yield* stateTaskFunction(target, fullStateName, ...args);
  }).drop();

  // save task
  target.set(getStateTaskName(fullStateName), stateTask);

  // find the default substate
  const defaultSubState = findDefaultSubState([fullStateName, stateHash]);
  if (defaultSubState !== null) {
    const [defaultSubStateName, ] = defaultSubState;
    target._defaultStateMapping[fullStateName] = getFullStateName(defaultSubStateName, fullStateName);
  }

  // put state actions at the top to be able to call them from components
  const actions = Object.entries(stateHash).filter(([key, val]) => isAction(key, val));
  for (const [name, ] of actions) {
    if (Ember.isNone(target.actions[name])) {
      target.actions[name] = function(...args) {
        this.send(name, ...args);
      }
    }
  }
  const subStates = findSubStates(stateHash);
  for (const [name, hash] of subStates) {
    initializeState(target, hash, name, fullStateName);
  }
}

/**
 * @see https://github.com/emberjs/ember.js/blob/v2.14.1/packages/ember-views/lib/mixins/action_support.js
 */

export function initializeStateHierarchy(target) {
  target._defaultStateMapping = {};
  const actions = Object.assign({}, target.actions);
  initializeState(target, actions, '_root', '_root');
  target.actions._root = actions;
}

function* stateTaskFunction(target, stateName, shouldStartDefaultSubtask = true) {
  if (stateName !== '_root') {
    const superStateName = getSuperStateName(stateName);
    const superState = target._getStateTask(superStateName);
    if (!superState.get('isRunning')) {
      // during transitions into a deeply nested structure the superstates will not
      // be running so kick them off first
      superState.perform(false);
    }
  }

  const stateActions = target.get(`actions.${stateName}`) || {};
  try {
    target.trigger(`try_${stateName}`);
    yield executeStateHook(target, stateActions._try);
    if (shouldStartDefaultSubtask) {
      const defaultStateName = target._getDefaultStateName(stateName);
      if (defaultStateName) {
        const defaultStateTask = target._getStateTask(defaultStateName);
        // we're cascading down until we hit a leaf state
        defaultStateTask.perform(true);
      }
    }
    // never ending yield to keep the task running
    yield WAIT_HERE_FOREVER;
  } catch(e) {
    // TODO: bubble the exception up
    if (stateActions._catch) {
      yield executeStateHook(target, stateActions._catch, e);
    } else {
      throw e;
    }
  } finally {
    // we are exiting so cancel the task group
    target.trigger(`finally_${stateName}`);
    yield executeStateHook(target, stateActions._finally);
  }
}

export function findYoungestCommonAncestor(state1, state2) {
  // find the index of the first character after the common prefix
  let i;
  for (i = 0; state1[i] !== undefined && state1[i] === state2[i]; i++) {
    ; // eslint-disable-line no-extra-semi
  }
  // last character of common prefix is probably a dot so move one character back
  if (state1[i-1] === '.') {
    i--;
  }
  const youngestCommonAncestor = state1.slice(0, i);
  return youngestCommonAncestor === ''? '_root' : youngestCommonAncestor;
}
