import { createContext } from "react";

export interface ContextProps {
  readonly isAppearing: boolean;
  register: (el: Element) => void;
  unregister: (el: Element) => void;
}

export const TransitionGroupContext = createContext<ContextProps | null>(null);
