import Dict from '../helpers/Dict'

/**
 * FSA Compliant changes
 */

/**
 * Action types, describes the type of event
 * (added, removed or changed)
 */
export enum ActionType {
  ADDED = '@@DOCUMENT_ADDED',
  REMOVED = '@@DOCUMENT_REMOVED',
  CHANGED = '@@DOCUMENT_CHANGED'
}

/**
 * @typeparam S the entity schema
 */
export type ChangeAction<S> =
  | {
      type: ActionType.ADDED
      payload: Dict<S>
      meta: { revision: string }
    }
  | {
      type: ActionType.CHANGED
      payload: Dict<S>
      meta: { revision: string }
    }
  | {
      type: ActionType.REMOVED
      payload: Dict<string>
      meta: {}
    }

/**
 * A function that listens for changes actions, can be a redux dispatch
 */
export type Subscriber<S> = (action: ChangeAction<S>) => void
