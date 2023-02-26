import {useState, useEffect} from "react";

function useLocalStorage(key, initialValue) {
  // if key is in local storage, get it 
  if (localStorage.getItem(key)) {
    initialValue = JSON.parse(localStorage.getItem(key))
  }
  const [value, setValue] = useState(initialValue);

  // set local storage whenever the value or key changes
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [value, key]);

  return [value, setValue]
}

export default useLocalStorage