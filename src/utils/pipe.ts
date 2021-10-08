const pipe =
  (...fns: ((...args: any[]) => any)[]) =>
  (...args_: any[]) =>
    fns.reduce((acc, cur) => cur(acc), args_);
