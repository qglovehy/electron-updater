const fabric = require('@umijs/fabric');

module.exports = {
    ...fabric.prettier,

    tabWidth: 2,
    semi: true, // 加分号
    singleQuote: true, //字符串是否使用单引号
    endOfLine: 'auto', //避免报错delete (cr)的错
    proseWrap: 'preserve',
    htmlWhitespaceSensitivity: 'ignore', // 忽略'>'下落问题
    arrowParens: 'always', //avoid 箭头函数总是使用括号

    //整理 import
    importOrder: [
        '^(?=(@[a-z]|[a-z])).*(?<!(css|less|scss|styl))$', // @或者非@ 且非@/开头  非css等结尾
        // '^(?=[a-z]).*(?<!(css|less|scss|styl))$',// 非@且非@/开头  非css等结尾

        '^(?=@/utils).*(?<!(css|less|scss|styl))$', // @/utils开头  非css等结尾
        '^(?=@/store).*(?<!(css|less|scss|styl))$', // @/store开头  非css等结尾
        '^(?=@/hooks).*(?<!(css|less|scss|styl))$', // @/hooks开头  非css等结尾
        '^(?=@/router).*(?<!(css|less|scss|styl))$', // @/router开头  非css等结尾
        '^(?=@/services).*(?<!(css|less|scss|styl))$', // @/services开头  非css等结尾
        '^(?=@/components).*(?<!(css|less|scss|styl))$', // @/components开头  非css等结尾
        '^(?=@/pages).*(?<!(css|less|scss|styl))$', // @/pages开头  非css等结尾
        '^(?=@/[a-z]).*(?<!(css|less|scss|styl))$', // @/开头  非css等结尾

        '^[?=.].*(?<!(css|less|scss|styl))$', // ./开头  非css等结尾

        '^[@].*(?<=(css|less|scss|styl))$', // @且非@/开头  css等结尾
        '^[@/].*(?<=(css|less|scss|styl))$', // @/开头  css等结尾
        '^.*(?<=(css|less|scss|styl))$', // .开头  css等结尾
    ],
    importOrderSeparation: true,
    importOrderSortSpecifiers: true,

    // trailingComma: 'none', // 结尾处不加逗号
};
