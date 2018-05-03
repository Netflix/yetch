exports.root = typeof window === 'object' ?
  window : typeof self === 'object' ?
    self : typeof global === 'object' ?
      global : null;
