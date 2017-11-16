import Ember from 'ember';
import StatefulMixin from 'ember-stateful/mixins/-stateful';
import { initializeStateHierarchy } from 'ember-stateful/utils/-utils';

export default function (classDefinition) {
  initializeStateHierarchy(classDefinition);
  return Ember.Mixin.create(StatefulMixin, classDefinition);
}
