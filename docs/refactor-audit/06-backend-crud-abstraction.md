# 06 后端 CRUD 模板代码抽象

## 现状

后端 `page` 和 `package` 基本是平行复制出来的两套 CRUD。

## 直接证据

- DAO：
  - `packages/moten-server/dao/page.js`
  - `packages/moten-server/dao/package.js`
- Controller：
  - `packages/moten-server/controller/page.js`
  - `packages/moten-server/controller/package.js`

## 重复点

- `findAll/findOne/create/update/remove`
- `Joi` 校验模板
- `response.success/response.fail` 返回结构
- `omit(req.body, ['id'])`
- 分页和按 id 倒序查询逻辑
- `create_time/update_time` 的 SQL 拼接

## 问题

- 现在是复制维护，后续改一个接口规则时另一边容易漏掉。
- DAO 代码直接拼 SQL 字段，重复多且容易引入细节差异。
- controller 里大量样板化错误处理，信噪比很低。

## 建议拆法

1. 抽一个 `BaseCrudDAO` 或 query builder 辅助层。
2. 抽一个 `createCrudController` 工厂。
3. 把分页、按 id 游标查询、时间字段注入变成共用工具。
4. 保留实体差异只在 schema 和表名配置层体现。

## 预期结果

- 新增实体接口不再靠复制 page/package。
- controller 和 dao 文件体积明显下降。
- 更适合后续补测试。
