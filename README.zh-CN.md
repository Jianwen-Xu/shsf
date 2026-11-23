# SHSF

[English](README.md) · 简体中文

先写 spec，再执行。事实由 agent 去查，决策由你来做。做完的活儿还要过一道**不能给自己放行**的门禁。

两个技能：`/shsf` 写 spec，`/boss` 判断结果是否兑现了它。

## 它怎么运转

```
1. 你:      shsf 给 /api/login 加 JWT 鉴权
2. Claude: 对相关代码做一轮有边界的侦察，然后写出
           .shsf/shsf-20261106-001-add-jwt-auth.md
           —— 事实已填好，3-7 条决策，每条带一个推荐答案
3. 你:     离线确认或推翻 —— 每条回一个 "yes" 通常就够了
4. 你:     go —— 所有阻塞决策答完后，status 自动封为 ready
5. Claude: 只实现确认过的范围，跑证据命令，
           报告 Changed / Verified / Test changes / Risk
6. Claude: risk: low 自己封成 done；risk: high 停在"等待你批准"——
           它可以报告自己的工作，但不能批准它。
```

两个阶段，中间你可以离开。spec 同时是一份可复盘的记录：这次改动为什么长这样。上下文被压缩、会话换掉，它都还在。

## 门禁

两个技能，一个产物：

```
/shsf    →  .shsf/<task>.md   （Scope、Acceptance、risk）
实现     →  代码
/boss    ←  读 spec 和 diff，产出裁决卡：pass | reject | needs-human
你       →  批准 / 拒绝
```

`/boss` 不信实现者的总结，而是从仓库里重新导出证据：拿 diff 对 `## Scope`，拿测试改动对事前声明的 `Test changes`，然后停下。它不能批准自己的工作，也从不自己把 spec 标成 done。它存在的全部意义是：让人的决策变便宜，而不是变空洞。

## 为什么最后一步要有人批准

一个自己实现、自己测试、自己打分的 agent，不构成证据。所以报告必须引用命令和它的真实输出，而不是宣称成功；测试改动要事前在 spec 的 `Test changes` 里声明，事后在报告里再对一次账；高风险改动不许自己标完成。这不是仪式 —— 是让"已验证"这三个字经得起第二个人复核。

## 分工

- **事实是 agent 的活儿。** 代码在哪、现在是什么行为、有哪些约定、最近的测试长什么样。
- **决策是你的。** 范围、取舍、命名、能接受什么样的破坏、什么算"好"。每条决策只给一个推荐答案，所以多数时候你回一个 "yes" 就够了。

## 这不是省 token 模式

这个插件的旧版本靠"不给模型上下文"来省 token，代价是上下文得你自己收集。agent 会读代码之后，这笔交易就不划算了。现在的 spec 是为了让人在写代码之前能看到计划。

如果你想的是边想边说、而不是写一个文件，用 `/grill-me` 这类访谈技能。spec 写完之后如果还有两条以上真正有争议的决策，把它交给访谈技能，而不是在聊天里随手解决。

## 什么时候别用

单文件改动、20 分钟以内的活、决策已经定死的任务。没有交接，仪式成本大于收益。

## 安装

```bash
claude plugins marketplace add Jianwen-Xu/shsf
claude plugins install shsf
```

单次会话试用：

```bash
claude --plugin-dir /path/to/shsf
```

## 用法

```
shsf 给 /api/login 加 JWT 鉴权
```

填好生成的 `.shsf/*.md`，然后说 `go`。所有阻塞决策都有答案后 `status` 会自己翻成 `ready`；你手动改也一样。

也可以写成 `/shsf 给 /api/login 加 JWT 鉴权`。

活儿干完后，**开一个新会话**：

```
/boss
```

它读 `.shsf/latest`，重跑验收证据，返回一张裁决卡。你回一个词批准或拒绝，spec 会记下结果。

## 校验 spec

Phase 2 拒绝在一个"ready 但还有阻塞决策没答"的 spec 上开工。你也可以自己跑同一个检查：

```bash
node skills/shsf/check.mjs              # 所有 .shsf/*.md
node skills/shsf/check.mjs .shsf/x.md   # 单个文件
```

未知 `status`，或 `status: ready` 却有未答的 `[blocking]` 决策 → exit `1`；缺章节、`risk` 值不认识 → 只是警告，仍然 exit `0`。

## 门禁一个改动

`/boss` 从不需要判断的那部分开始：

```bash
node skills/boss/gate.mjs --spec .shsf/x.md            # 工作区
node skills/boss/gate.mjs --spec .shsf/x.md --base main --head HEAD
node skills/boss/gate.mjs --spec .shsf/x.md --strict   # 有未声明的测试改动才 exit 1
```

它打印改了什么、哪些是测试文件、`Test changes` 是否声明过它们、以及哪些改动文件 spec 里从没提过。它不产出裁决 —— 它只是把记账的活儿拿走，让裁决只关于判断，不关于眼力。

## 文件

```
skills/shsf/SKILL.md           两阶段协议
skills/shsf/shsf-template.md   Phase 1 拷贝的 spec 模板
skills/shsf/check.mjs          Phase 2 运行的 spec 校验器
skills/boss/SKILL.md           给已完成的改动放行的门禁
skills/boss/gate.mjs           机械部分：diff、测试文件、未提及的路径
.shsf/                         生成出来的 spec，一个任务一份（值得提交）
.shsf/latest                   指向最新 spec 的指针（已 gitignore）
```

spec 值得入库：它记录的是改动背后的决策，而不只是 diff。

## License

MIT
