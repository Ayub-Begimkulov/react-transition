import { ReactElement } from "react";
import { hasOwn } from ".";
import { __DEV__ } from "../constants";

export function getChildMapping(children: ReactElement[]) {
  const result = {} as Record<string, ReactElement>;
  children.forEach(child => {
    if (!child.key || hasOwn(result, child.key)) {
      if (__DEV__) {
        throw new Error(
          "[retransition]: <TransitionGroup /> children must have unique keys." +
            "The key " +
            child.key +
            " is already used"
        );
      }
      return;
    }
    result[child.key] = child;
  });
  return result;
}

export function mergeChildMappings(
  prev: Record<string, ReactElement> = {},
  next: Record<string, ReactElement> = {}
) {
  function getValueForKey(key: string) {
    return hasOwn(next, key) ? next[key] : prev[key];
  }

  // For each key of `next`, the list of keys to insert before that key in
  // the combined list
  const nextKeysPending = Object.create(null);

  let pendingKeys: string[] = [];
  for (const prevKey in prev) {
    if (hasOwn(next, prevKey)) {
      if (pendingKeys.length) {
        nextKeysPending[prevKey] = pendingKeys;
        pendingKeys = [];
      }
    } else {
      pendingKeys.push(prevKey);
    }
  }

  let i;
  const childMapping: Record<string, ReactElement> = {};
  for (const nextKey in next) {
    if (nextKeysPending[nextKey]) {
      for (i = 0; i < nextKeysPending[nextKey].length; i++) {
        const pendingNextKey = nextKeysPending[nextKey][i];
        childMapping[pendingNextKey] = getValueForKey(pendingNextKey);
      }
    }
    childMapping[nextKey] = getValueForKey(nextKey);
  }

  // Finally, add the keys which didn't appear before any key in `next`
  for (i = 0; i < pendingKeys.length; i++) {
    childMapping[pendingKeys[i]] = getValueForKey(pendingKeys[i]);
  }

  return childMapping;
}
