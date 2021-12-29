SEC-SANDBOX
======================

## 开发工具

本项目依赖 tea-cli 进行工程化开发，请先安装。

```
npm i @tencent/tea-cli -g --registry=http://r.tnpm.oa.com --proxy=http://127.0.0.1:12639
```

## 开发

使用 tea dev 命令启动本地开发服务器：

```
tea dev
```

## 组件

使用 Tea 组件进行开发，文档地址：http://tea.tencent.com/component

## 构建

```
tea build
```

## 目录规范

- `src/app.ts` 入口文件，主要进行业务路由定义
- `src/routes` 存放业务路由实现
- `src/configs` 存放 CSS 和菜单配置
- `src/components` 存放公共业务组件
- `src/utils` 存放公共工具方法