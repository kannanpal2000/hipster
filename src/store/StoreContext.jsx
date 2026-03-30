import { createContext, useContext, useState, useEffect } from 'react';
import store from './reducer';

export const StoreCtx = createContext(null);

/** Returns the raw Redux store instance. */
export const useStore = () => useContext(StoreCtx);

/** Subscribe to derived state from the Redux store (like react-redux useSelector). */
export const useSelector = (fn) => {
  const s = useStore();
  const [value, setValue] = useState(() => fn(s.getState()));
  useEffect(() => {
    const unsubscribe = s.subscribe(() => setValue(fn(s.getState())));
    return unsubscribe;
  }, [s, fn]);
  return value;
};

/** Returns the Redux dispatch function. */
export const useDispatch = () => useStore().dispatch;

export { store };
