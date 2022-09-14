module.exports = {
  root: true,
  extends: '@react-native-community',
  parser: '@babel/eslint-parser',
  plugins: ['import', 'react', 'react-native', 'flowtype', 'react-hooks'],
  rules: {
    'prettier/prettier': 'off',
    'react-hooks/exhaustive-deps': 'error',
    'react-native/no-inline-styles': 'off',
    'react/jsx-indent-props': [0, 4], // 验证JSX中的props缩进
    'newline-per-chained-call': ['error', {ignoreChainWithDepth: 4}], // 要求方法链中调用有一个换行符
    indent: [
      'error',
      4,
      {
        ImportDeclaration: 'first',
        SwitchCase: 1,
      },
    ], // 推荐使用4个空格
  },
};
