module.exports = {
  parser: '@typescript-eslint/parser', // 定义解析器
  // extends: [require.resolve('@umijs/fabric/dist/eslint')],
  globals: {
    page: true,
    APP_ENV: true,
    NO_MOCK: true,
  },
  env: {
    browser: true,
    es6: true,
    node: true,
  },
  plugins: ['react'],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    project: ['./tsconfig.json'],
  },
  rules: {
    '@typescript-eslint/consistent-type-imports': 0,
    // 'prettier/prettier': 0,
    semi: 2, // 强制使用分号
    quotes: [1, 'single'], // 单引号
    noUnusedLocals: 0,
    // 'no-console': 2,
    camelcase: 0, // 强制驼峰法命名
    'jsx-a11y/anchor-is-valid': 0, //a标签
    'no-extra-semi': 2, // 禁止出现多余的分号
    'array-callback-return': 0, //return规则强制在数组方法的回调中使用语句。
    'for-direction': 2, // 禁止 for 循环出现方向错误的循环，比如 for (i = 0; i < 10; i--)
    'no-empty-character-class': 2, // 禁止在正则表达式中使用空的字符集 []
    'no-extra-parens': [2, 'functions'], // 禁止函数表达式中出现多余的括号
    'no-regex-spaces': 2, // 禁止在正则表达式中出现连续的空格
    'no-sparse-arrays': 2, // 禁止在数组中出现连续的逗号
    'no-unreachable': 2, // 禁止在 return, throw, break 或 continue 之后还有代码
    'no-template-curly-in-string': 0, // 禁止出现难以理解的多行表达式
    'max-depth': [2, 5], // 代码块嵌套的深度禁止超过 5 层
    'max-params': [2, 6], // 函数的参数禁止超过 6 个
    'no-whitespace-before-property': 2, // 禁止属性前有空格
    'newline-per-chained-call': 0, //链式调用必须换行
    'object-property-newline': 0, // 对象字面量内的属性每行必须只有一个
    'no-debugger': 0, // 不禁用debugger
    'no-var': 0, // 对var警告
    'no-irregular-whitespace': 0, // 不规则的空白不允许
    'no-trailing-spaces': 0, // 一行结束后面有空格就发出警告
    'eol-last': 0, // 文件以单一的换行符结束
    'no-underscore-dangle': 0, // 标识符不能以_开头或结尾
    'no-lone-blocks': 0, // 禁止不必要的嵌套块
    'no-class-assign': 2, // 禁止给类赋值
    'no-cond-assign': 0, // 禁止在条件表达式中使用赋值语句
    'no-const-assign': 2, // 禁止修改const声明的变量
    'no-delete-var': 0, // 不能对var声明的变量使用delete操作符
    'no-dupe-keys': 2, // 在创建对象字面量时不允许键重复
    'no-duplicate-case': 2, // switch中的case标签不能重复
    'no-useless-catch': 0, //允许try catch
    'no-dupe-args': 2, // 函数参数不能重复
    'no-invalid-this': 0, // 禁止无效的this，只能用在构造器，类，对象字面量
    'no-redeclare': 2, // 禁止重复声明变量
    'no-spaced-func': 2, // 函数调用时 函数名与()之间不能有空格
    'no-this-before-super': 0, // 在调用super()之前不能使用this或super
    'no-undef': 2, // 不能有未定义的变量
    'no-use-before-define': 0, // 未定义前不能使用
    'newline-before-return': 2, // 要求 return 语句之前有一空行
    'react/display-name': 0, // 防止在React组件定义中丢失displayName
    'react/forbid-prop-types': [2, { forbid: ['any'] }], // 禁止某些propTypes
    'react/jsx-boolean-value': 2, // 在JSX中强制布尔属性符号
    'react/jsx-key': 2, // 在数组或迭代器中验证JSX具有key属性
    'react/jsx-max-props-per-line': [0, { maximum: 3 }], // 限制JSX中单行上的props的最大数量
    'react/jsx-no-bind': 0, // JSX中不允许使用箭头函数和bind
    'react/jsx-no-duplicate-props': 2, // 防止在JSX中重复的props
    'react/jsx-no-literals': 0, // 防止使用未包装的JSX字符串
    'react/jsx-no-undef': [0, { allowGlobals: true }], // 在JSX中禁止未声明的变量
    'react/jsx-pascal-case': 0, // 为用户定义的JSX组件强制使用PascalCase
    'react/jsx-sort-props': 2, // 强化props按字母排序
    'react/jsx-uses-react': 1, // 防止反应被错误地标记为未使用
    'react/no-danger': 0, // 防止使用危险的JSX属性
    'react/no-did-mount-set-state': 0, // 防止在componentDidMount中使用setState
    'react/no-did-update-set-state': 1, // 防止在componentDidUpdate中使用setState
    'react/no-direct-mutation-state': 2, // 防止this.state的直接变异
    'react/no-set-state': 0, // 防止使用setState
    'react/no-unknown-property': 2, // 防止使用未知的DOM属性
    'react/prefer-es6-class': 2, // 为React组件强制执行ES5或ES6类
    'react/prop-types': 0, // 防止在React组件定义中丢失props验证
    'react/react-in-jsx-scope': 2, // 使用JSX时防止丢失React
    'react/self-closing-comp': 0, // 防止没有children的组件的额外结束标签
    'react/sort-comp': 2, // 强制组件方法顺序
    'no-extra-boolean-cast': 0, // 禁止不必要的bool转换
    'react/no-array-index-key': 0, // 防止在数组中遍历中使用数组key做索引
    'react/no-deprecated': 0, // 使用弃用的方法
    'react/jsx-equals-spacing': 2, // 在JSX属性中强制或禁止等号周围的空格
    'react-hooks/exhaustive-deps': 0, //关闭 React Hook useEffect缺少一个依赖项
    'no-mixed-spaces-and-tabs': 0, // 禁止混用tab和空格
    'prefer-arrow-callback': 0, // 比较喜欢箭头回调
    'arrow-parens': 1, // 箭头函数用小括号括起来
    'arrow-spacing': 0, //= >的前/后括号
    'arrow-body-style': [2, 'as-needed'], // =>的前/后括号
    'no-empty-function': [
      1,
      {
        allow: ['functions', 'arrowFunctions'],
      },
    ], // 不允许有空函数，除非是将一个空函数设置为某个项的默认值
    'vars-on-top': 2,
    'keyword-spacing': [
      2,
      {
        before: true,
        after: true,
      },
    ], // 关键字前后必须有空格
    'key-spacing': [
      0,
      {
        beforeColon: false,
        afterColon: true,
      },
    ], //对象字面量中冒号的前后空格
    'no-unused-vars': [
      0,
      {
        vars: 'all',
        varsIgnorePattern: '^_',
        args: 'after-used',
        argsIgnorePattern: '^_',
        ignoreRestSiblings: false,
      },
    ], // 禁止出现未使用过的变量
    'no-multiple-empty-lines': [
      1,
      {
        max: 3,
        maxEOF: 1,
        maxBOF: 1,
      },
    ], // 禁止出现超过三行的连续空行
    'nonblock-statement-body-position': [
      2,
      'beside',
      {
        overrides: {
          while: 'below',
        },
      },
    ], // 禁止 if 后面不加大括号而写两行代码
    'object-curly-newline': [
      2,
      {
        multiline: true,
        consistent: true,
      },
    ], // 大括号内的首尾必须有换行
    'react/jsx-curly-spacing': [
      2,
      {
        when: 'never',
        children: true,
      },
    ], // 在JSX属性和表达式中加强或禁止大括号内的空格。

    // indent: [0, 4], //tab缩进
    // 'react/no-multi-comp': 2, // 防止每个文件有多个组件定义
    // 'comma-dangle': 0, // 对象字面量项尾不能有逗号
    //'react/no-unescaped-entities': 2 // 禁止出现 HTML 中的属性，如 class
    // 'react/jsx-indent': [2, 4],
    // 'react/jsx-indent-props': [2, 4], // 验证JSX中的props缩进
    // 'no-console': [1, { allow: ['info', 2] }],//不允许console,除了console.info和console.error
    // 'no-empty': 2, // 块语句中的内容不能为空
    // 'jsx-quotes': [2, 'prefer-double'], // 强制在JSX属性（jsx-quotes）中一致使用双引号
    // 'react/jsx-closing-bracket-location': 1, // 在JSX中验证右括号位置
    // 'unused-imports/no-unused-imports-ts': 2, //禁止未使用的导入声明
  },
};
