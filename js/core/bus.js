(function (L) {
  const handlers = {};
  L.bus = {
    on(name, fn) {
      (handlers[name] || (handlers[name] = [])).push(fn);
      return () => { handlers[name] = handlers[name].filter((f) => f !== fn); };
    },
    emit(name, payload) {
      for (const fn of (handlers[name] || []).slice()) fn(payload);
    },
  };
})(globalThis.LUM);
