# Plan 阶段请求回执纠错简报

- **已观察失败：** 一次Plan synthesis transition会预留Builder与Reviewer两个席位，但保存产物无法区分Reviewer只是被预留，还是供应商请求已经启动但结果丢失。因此中断用量可能缺失，也容易被误当成零。
- **用户产物：** 保留Plan、已接受日期、阶段身份、请求ID、请求输出上限，以及当前能确认的最真实用量状态。绝不保存凭证、供应商原始输出或私有推理。
- **最小假设：** 每个付费Plan阶段都需要独立于外层双席transition的持久生命周期回执。供应商调用前发出一条finish与usage均未知的`started`回执，终态再原位替换，就足以区分“未启动”和“已启动/未知”。
- **改动边界：** 为`PlanAttempt.outcome`增加`started`；按请求ID与阶段确定性upsert；在Builder/Reviewer各自调用`streamProvider`前发出并保存started检查点；接受、拒绝或供应商错误时替换同一回执。继续遵守最多四条当前/终态回执的既有上限。
- **验收：** 旧产物继续解析；畸形started回执失败；started显示未知用量而非零；终态替换不产生重复；Builder start早于Builder供应商调用；Reviewer只有Builder接受后才出现start且早于Reviewer调用；供应商失败把started替换为`provider_error`；历史可往返生命周期状态。
- **费用与停止边界：** 零真实供应商调用，不改模型/prompt/reasoning/输出/预算/重试，不迁移旧记录，不建设通用账单平台。应用估算仍只供参考，供应商账单仍权威。离线构建/测试/lint/类型检查及双语文档完成即停止。
