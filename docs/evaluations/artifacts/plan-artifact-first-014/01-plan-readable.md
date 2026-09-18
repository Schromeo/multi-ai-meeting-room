# Live 014 - Sol Builder Plan

Contract: 12 days, minimum 10 MEU/day, maximum 360 minutes/day. Hard=2 Medium; 3 Easy=1 Medium. Problem metadata is model-supplied and was not externally verified. Fable review was rejected as invalid JSON, so this is the unreviewed Builder artifact.

## Day 1 - 数组、哈希、双指针与滑窗基础

先建立频次表、前缀和、单调移动等面试高频不变量。高强度前提：具备基础且这些题尚未系统掌握。10.00 MEU, 360 minutes, 10 new / 0 redo.

| Problem | Difficulty | Work | Minutes |
| --- | --- | --- | ---: |
| #3 Longest Substring Without Repeating Characters | medium | new | 30 |
| #49 Group Anagrams | medium | new | 30 |
| #238 Product of Array Except Self | medium | new | 30 |
| #560 Subarray Sum Equals K | medium | new | 30 |
| #15 3Sum | medium | new | 30 |
| #11 Container With Most Water | medium | new | 30 |
| #75 Sort Colors | medium | new | 30 |
| #167 Two Sum II - Input Array Is Sorted | medium | new | 30 |
| #209 Minimum Size Subarray Sum | medium | new | 30 |
| #713 Subarray Product Less Than K | medium | new | 30 |

Review (60 min): 10题均独立提交通过；能口述各自不变量、复杂度及边界，并把超时、误判和看提示处写入错误日志。

Adjustment: 30分钟到点即停止盲试并记录卡点；总计360分钟仍未全过则标记缺少的MEU，不宣称完成，下一学习日先重复本日未完成部分再推进。

## Day 2 - 栈、队列与区间

在数组扫描基础上训练状态保存和区间排序。重做第1天两题形成1日检索。10.00 MEU, 360 minutes, 8 new / 2 redo.

| Problem | Difficulty | Work | Minutes |
| --- | --- | --- | ---: |
| #155 Min Stack | medium | new | 32 |
| #394 Decode String | medium | new | 32 |
| #739 Daily Temperatures | medium | new | 32 |
| #150 Evaluate Reverse Polish Notation | medium | new | 32 |
| #71 Simplify Path | medium | new | 32 |
| #853 Car Fleet | medium | new | 32 |
| #56 Merge Intervals | medium | new | 32 |
| #57 Insert Interval | medium | new | 32 |
| #238 Product of Array Except Self | medium | redo | 20 |
| #15 3Sum | medium | redo | 20 |

Review (64 min): 全部10个Medium等价量通过；重做不得查看旧代码，栈题能说明入栈出栈条件，区间题能说明排序键及重叠判定。

Adjustment: 若重做超过20分钟，标记为未掌握而非复习完成；360分钟到点仍有缺口则暂停后续日程，增加一个补课日完成对应MEU。

## Day 3 - 链表指针操作与二分搜索

先掌握局部重连，再训练有序空间中的边界收缩。安排第1天2日、第2天1日检索。10.00 MEU, 360 minutes, 8 new / 2 redo.

| Problem | Difficulty | Work | Minutes |
| --- | --- | --- | ---: |
| #2 Add Two Numbers | medium | new | 32 |
| #19 Remove Nth Node From End of List | medium | new | 32 |
| #24 Swap Nodes in Pairs | medium | new | 32 |
| #92 Reverse Linked List II | medium | new | 32 |
| #143 Reorder List | medium | new | 32 |
| #33 Search in Rotated Sorted Array | medium | new | 32 |
| #34 Find First and Last Position of Element in Sorted Array | medium | new | 32 |
| #153 Find Minimum in Rotated Sorted Array | medium | new | 32 |
| #209 Minimum Size Subarray Sum | medium | redo | 20 |
| #56 Merge Intervals | medium | redo | 20 |

Review (64 min): 10题通过；链表题画出指针重连前后图，二分题写清循环不变量和终止条件，错误日志注明空链表、偶数长度及重复值问题。

Adjustment: 若链表出现环或断链，复盘时用3节点最小样例逐步跟踪；若360分钟内未完成10 MEU，记录具体未过题并延后下一日，不以看答案算完成。

## Day 4 - 二叉树遍历、构造与递归返回值

依赖栈和指针基础。加入第1天3日与第3天1日检索。10.00 MEU, 360 minutes, 8 new / 2 redo.

| Problem | Difficulty | Work | Minutes |
| --- | --- | --- | ---: |
| #102 Binary Tree Level Order Traversal | medium | new | 32 |
| #103 Binary Tree Zigzag Level Order Traversal | medium | new | 32 |
| #199 Binary Tree Right Side View | medium | new | 32 |
| #98 Validate Binary Search Tree | medium | new | 32 |
| #230 Kth Smallest Element in a BST | medium | new | 32 |
| #236 Lowest Common Ancestor of a Binary Tree | medium | new | 32 |
| #105 Construct Binary Tree from Preorder and Inorder Traversal | medium | new | 32 |
| #114 Flatten Binary Tree to Linked List | medium | new | 32 |
| #560 Subarray Sum Equals K | medium | redo | 20 |
| #33 Search in Rotated Sorted Array | medium | redo | 20 |

Review (64 min): 10题均通过；每道树题能说明递归函数含义、基例和返回信息，且用空树、单节点、偏斜树验证。

Adjustment: 递归题连续两次无法定义返回值时，先在错误日志写函数契约再实现；达到360分钟仍未完成则登记MEU缺口并安排补课日。

## Day 5 - 堆、贪心与调度

建立选择规则、交换论证和Top-K模板。加入第2天3日与第4天1日检索。10.00 MEU, 360 minutes, 8 new / 2 redo.

| Problem | Difficulty | Work | Minutes |
| --- | --- | --- | ---: |
| #215 Kth Largest Element in an Array | medium | new | 32 |
| #347 Top K Frequent Elements | medium | new | 32 |
| #973 K Closest Points to Origin | medium | new | 32 |
| #621 Task Scheduler | medium | new | 32 |
| #767 Reorganize String | medium | new | 32 |
| #45 Jump Game II | medium | new | 32 |
| #55 Jump Game | medium | new | 32 |
| #134 Gas Station | medium | new | 32 |
| #739 Daily Temperatures | medium | redo | 20 |
| #98 Validate Binary Search Tree | medium | redo | 20 |

Review (64 min): 10题通过；堆题能解释堆大小，贪心题能给出选择规则及反例排除，重做必须从空白编辑器完成。

Adjustment: 若只记住贪心结论却不能解释正确性，该题记为未掌握；360分钟到点停止并保留未完成MEU，先补齐再进入图论。

## Day 6 - 图的DFS、BFS、拓扑排序与并查集入门

复用树遍历并扩展到访问集和入度。加入第3天3日与第5天1日检索。10.00 MEU, 360 minutes, 8 new / 2 redo.

| Problem | Difficulty | Work | Minutes |
| --- | --- | --- | ---: |
| #200 Number of Islands | medium | new | 32 |
| #133 Clone Graph | medium | new | 32 |
| #994 Rotting Oranges | medium | new | 32 |
| #207 Course Schedule | medium | new | 32 |
| #210 Course Schedule II | medium | new | 32 |
| #417 Pacific Atlantic Water Flow | medium | new | 32 |
| #130 Surrounded Regions | medium | new | 32 |
| #684 Redundant Connection | medium | new | 32 |
| #2 Add Two Numbers | medium | redo | 20 |
| #215 Kth Largest Element in an Array | medium | redo | 20 |

Review (64 min): 10题通过；能从题意选择DFS、BFS、拓扑或并查集，并解释访问时机、环检测及复杂度。

Adjustment: 若因重复访问超时，复盘时明确入队即标记还是出队标记；360分钟内不足10 MEU则如实记缺口并增加补课日。

## Day 7 - 回溯与Trie

在递归契约之上训练选择、撤销、剪枝及前缀状态。加入第4天3日与第6天1日检索。10.00 MEU, 360 minutes, 8 new / 2 redo.

| Problem | Difficulty | Work | Minutes |
| --- | --- | --- | ---: |
| #46 Permutations | medium | new | 32 |
| #78 Subsets | medium | new | 32 |
| #39 Combination Sum | medium | new | 32 |
| #40 Combination Sum II | medium | new | 32 |
| #131 Palindrome Partitioning | medium | new | 32 |
| #79 Word Search | medium | new | 32 |
| #208 Implement Trie (Prefix Tree) | medium | new | 32 |
| #211 Design Add and Search Words Data Structure | medium | new | 32 |
| #105 Construct Binary Tree from Preorder and Inorder Traversal | medium | redo | 20 |
| #207 Course Schedule | medium | redo | 20 |

Review (64 min): 10题通过；回溯题写出路径、候选集合、终止条件和撤销动作，Trie题能解释通配搜索的最坏复杂度。

Adjustment: 若产生重复答案，优先检查排序、同层去重和索引推进；360分钟到点未达10 MEU则暂停推进并补齐，不用抄模板计完成。

## Day 8 - 一维动态规划

由递归搜索过渡到状态、转移、初始化和空间压缩。加入第5天3日与第7天1日检索。10.00 MEU, 360 minutes, 8 new / 2 redo.

| Problem | Difficulty | Work | Minutes |
| --- | --- | --- | ---: |
| #198 House Robber | medium | new | 32 |
| #213 House Robber II | medium | new | 32 |
| #322 Coin Change | medium | new | 32 |
| #139 Word Break | medium | new | 32 |
| #300 Longest Increasing Subsequence | medium | new | 32 |
| #152 Maximum Product Subarray | medium | new | 32 |
| #416 Partition Equal Subset Sum | medium | new | 32 |
| #91 Decode Ways | medium | new | 32 |
| #45 Jump Game II | medium | redo | 20 |
| #39 Combination Sum | medium | redo | 20 |

Review (64 min): 10题通过；每道DP题先写状态定义、转移来源、初始化和遍历顺序，再编码；至少比较一题DP与贪心或回溯方案。

Adjustment: 若只能背转移式，该题记为未掌握并用小输入手算状态表；超过360分钟则登记未完成MEU并安排补课日。

## Day 9 - 二维DP、序列DP与网格状态

在一维DP后增加维度和依赖顺序。加入第6天3日与第8天1日检索。10.00 MEU, 360 minutes, 8 new / 2 redo.

| Problem | Difficulty | Work | Minutes |
| --- | --- | --- | ---: |
| #62 Unique Paths | medium | new | 32 |
| #63 Unique Paths II | medium | new | 32 |
| #64 Minimum Path Sum | medium | new | 32 |
| #221 Maximal Square | medium | new | 32 |
| #1143 Longest Common Subsequence | medium | new | 32 |
| #673 Number of Longest Increasing Subsequence | medium | new | 32 |
| #646 Maximum Length of Pair Chain | medium | new | 32 |
| #1027 Longest Arithmetic Subsequence | medium | new | 32 |
| #200 Number of Islands | medium | redo | 20 |
| #322 Coin Change | medium | redo | 20 |

Review (64 min): 10题通过；能画出二维依赖方向，说明序列DP为何按该顺序遍历，并记录状态遗漏、初始化和越界错误。

Adjustment: 二维状态超过10分钟仍定义不清时先写自然语言子问题；360分钟到点未达标则明确缺少题目及MEU，补齐后再学加权图。

## Day 10 - 并查集、加权图、最短路与最小生成树

依赖第6天图基础并强化算法选择。加入第7天3日与第9天1日检索。10.00 MEU, 360 minutes, 8 new / 2 redo.

| Problem | Difficulty | Work | Minutes |
| --- | --- | --- | ---: |
| #721 Accounts Merge | medium | new | 32 |
| #743 Network Delay Time | medium | new | 32 |
| #787 Cheapest Flights Within K Stops | medium | new | 32 |
| #1584 Min Cost to Connect All Points | medium | new | 32 |
| #1631 Path With Minimum Effort | medium | new | 32 |
| #399 Evaluate Division | medium | new | 32 |
| #547 Number of Provinces | medium | new | 32 |
| #1319 Number of Operations to Make Network Connected | medium | new | 32 |
| #208 Implement Trie (Prefix Tree) | medium | redo | 20 |
| #64 Minimum Path Sum | medium | redo | 20 |

Review (64 min): 10题通过；能区分BFS、Dijkstra、Bellman-Ford式分层、Prim和并查集适用条件，并给出复杂度。

Adjustment: 若算法选择错误，错误日志必须写导致失败的图性质；360分钟仍未完成则保留MEU缺口并增加补课日，不能用阅读题解替代提交。

## Day 11 - 跨主题Hard与综合迁移

在滑窗、双指针、链表和树基础上提升未知题拆解能力。含2 Hard+6 Medium=10 MEU，并安排第8天3日、第10天1日检索。10.00 MEU, 360 minutes, 6 new / 2 redo.

| Problem | Difficulty | Work | Minutes |
| --- | --- | --- | ---: |
| #42 Trapping Rain Water | hard | new | 45 |
| #76 Minimum Window Substring | hard | new | 45 |
| #438 Find All Anagrams in a String | medium | new | 30 |
| #54 Spiral Matrix | medium | new | 30 |
| #437 Path Sum III | medium | new | 30 |
| #148 Sort List | medium | new | 30 |
| #416 Partition Equal Subset Sum | medium | redo | 20 |
| #787 Cheapest Flights Within K Stops | medium | redo | 20 |

Review (110 min): 2 Hard和6 Medium全部通过，共10 MEU；Hard题需写出暴力基线、优化瓶颈、不变量和复杂度，复盘时从错误日志重写关键代码段。

Adjustment: 本日Hard密度风险最高；45分钟无可行方案即记录卡点并进入复盘。360分钟未全过就标记实际MEU，不降低目标，增加补课日后再做总测。

## Day 12 - 全程闭卷计时总测

从数组、区间、二分、树、堆、图、回溯、DP和最短路抽取旧题，形成约1至9日间隔检索并检查迁移稳定性。10.00 MEU, 360 minutes, 0 new / 10 redo.

| Problem | Difficulty | Work | Minutes |
| --- | --- | --- | ---: |
| #3 Longest Substring Without Repeating Characters | medium | redo | 25 |
| #56 Merge Intervals | medium | redo | 25 |
| #33 Search in Rotated Sorted Array | medium | redo | 25 |
| #98 Validate Binary Search Tree | medium | redo | 25 |
| #215 Kth Largest Element in an Array | medium | redo | 25 |
| #207 Course Schedule | medium | redo | 25 |
| #39 Combination Sum | medium | redo | 25 |
| #322 Coin Change | medium | redo | 25 |
| #64 Minimum Path Sum | medium | redo | 25 |
| #787 Cheapest Flights Within K Stops | medium | redo | 25 |

Review (110 min): 闭卷完成并通过10题；至少8题在25分钟内一次通过，其余题修正后也须通过；按模式识别、实现、边界和复杂度四类汇总错误及后续复习日期。

Adjustment: 任何预先记熟代码不得直接默写，必须先解释推导；360分钟后仍未通过的题按实际MEU记为缺口并追加补测日。整体强度可能损害吸收，且题目元数据未联网复核，如平台显示不同应保留异议并据实际难度重新核算。
