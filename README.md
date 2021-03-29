# react-sourcecode-analyze

## hooks理念
1. 代数效应
    - 将副作用从函数组件中剥离出来

## 源码实现
1. useState在mount和update时使用的是对应的useState
2. useMemo,useCallback都是缓存变量，唯一的区别就是usememo会执行函数，usecallback则不会