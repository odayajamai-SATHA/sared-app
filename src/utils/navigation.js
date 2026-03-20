const DEBOUNCE_MS = 300;

export function createDebouncedNav(navigation) {
  let lastNavTime = 0;
  const debounce = (fn) => (...args) => {
    const now = Date.now();
    if (now - lastNavTime < DEBOUNCE_MS) return;
    lastNavTime = now;
    fn(...args);
  };

  return {
    navigate: debounce((...args) => navigation.navigate(...args)),
    replace: debounce((...args) => navigation.replace(...args)),
    goBack: () => navigation.goBack(),
    reset: (...args) => navigation.reset(...args),
  };
}
