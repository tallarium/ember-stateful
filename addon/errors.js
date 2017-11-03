export default {
  DEFAULT_SUBSTATE_NOT_DEFINED: (superState) => `Assertion error: the default substate for ${superState} is not defined`,
  MULTIPLE_DEFAULT_SUBSTATES: (superState, subStates) => `Assertion error: there are multiple default substates defined for ${superState}: ${JSON.stringify(subStates)}`,
  NO_ROOT_ACTION: (actionName, actionObject) => `A root action named '${actionName}' was not found in ${actionObject}`,
  NO_RUNNING_STATE: () => 'There is no state running!',
  NO_SUCH_STATE: (stateName) => `Assertion error: There is no state named "${stateName}"!`,
}
