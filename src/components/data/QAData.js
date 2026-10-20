/**
 * 一般法律问答数据（与 company 无关）
 *
 * 共 7 章（恋爱、理财章节已注释停用，保留数据以便恢复）：出行、租房、校园、职场、消费、保险、其他
 *
 * 数据采用 QAcard 方式组织（与 src/components/Articles/QACard.js 的关联机制一致）：
 * - 问题（LAW_QA_QUESTIONS）：每条问题用 cid 标记，自带 chapter 与 question 字段
 * - 回答/评论（LAW_QA_ANSWERS）：原 comment 数组拆成独立条目，category.label 指向所属问题的 cid
 * - 建议（LAW_QA_SUGGESTIONS）：每条建议独立成条，category.label 指向所属问题的 cid
 * - 关联规则：category.label === (question.cid || question.id)
 *
 * 兼容导出 LAW_QA 为旧的扁平结构（由以上三组数据派生），供旧代码使用。
 */

// ==================== 问题（cid 标记问题） ====================
export const LAW_QA_QUESTIONS = [
  // ==================== 出行 ====================
  {
    id: 'travel-001',
    cid: 'lawqa-travel-001',
    chapter: 'travel',
    question: '打车遇到司机故意绕路，费用多出近一倍怎么办？',
    category: { type: 'qa-com', label: '问答' },
  },
  {
    id: 'travel-002',
    cid: 'lawqa-travel-002',
    chapter: 'travel',
    question: '飞机延误 6 小时，航空公司只给了一瓶水，能索赔吗？',
    category: { type: 'qa-com', label: '问答' },
  },
  {
    id: 'travel-003',
    cid: 'lawqa-travel-003',
    chapter: 'travel',
    question: '高铁票改签被收取 20% 手续费，这合理吗？',
    category: { type: 'qa-com', label: '问答' },
  },
  {
    id: 'travel-004',
    cid: 'lawqa-travel-004',
    chapter: 'travel',
    question: '共享单车押金不退、余额不能提现，如何维权？',
    category: { type: 'qa-com', label: '问答' },
  },

  /* ==================== 恋爱（已注释停用，保留数据以便恢复） ====================
  {
    id: 'love-001',
    cid: 'lawqa-love-001',
    chapter: 'love',
    question: '恋爱期间转账给对方的钱，分手后能要回来吗？',
    category: { type: 'qa-com', label: '问答' },
  },
  {
    id: 'love-002',
    cid: 'lawqa-love-002',
    chapter: 'love',
    question: '订婚后双方分手，彩礼和五金能要回来吗？',
    category: { type: 'qa-com', label: '问答' },
  },
  {
    id: 'love-003',
    cid: 'lawqa-love-003',
    chapter: 'love',
    question: '被前任在网上散布隐私照片，可以报警吗？',
    category: { type: 'qa-com', label: '问答' },
  },
  {
    id: 'love-004',
    cid: 'lawqa-love-004',
    chapter: 'love',
    question: '情侣合买房子，分手后房产如何分割？',
    category: { type: 'qa-com', label: '问答' },
  },

  */
  // ==================== 租房 ====================
  {
    id: 'rental-001',
    cid: 'lawqa-rental-001',
    chapter: 'rental',
    question: '退租时房东以各种理由扣押金，合法吗？',
    category: { type: 'qa-com', label: '问答' },
  },
  {
    id: 'rental-002',
    cid: 'lawqa-rental-002',
    chapter: 'rental',
    question: '房东在租期内把房子卖了，新房东要求我立即搬走，合法吗？',
    category: { type: 'qa-com', label: '问答' },
  },
  {
    id: 'rental-003',
    cid: 'lawqa-rental-003',
    chapter: 'rental',
    question: '合租室友吵到无法休息，可以单方面解除合同退租吗？',
    category: { type: 'qa-com', label: '问答' },
  },
  {
    id: 'rental-004',
    cid: 'lawqa-rental-004',
    chapter: 'rental',
    question: '租的房子甲醛超标，可以要求退租退押金吗？',
    category: { type: 'qa-com', label: '问答' },
  },

  // ==================== 校园 ====================
  {
    id: 'campus-001',
    cid: 'lawqa-campus-001',
    chapter: 'campus',
    question: '大学生遭遇"校园贷"高利贷，利息可以不还吗？',
    category: { type: 'qa-com', label: '问答' },
  },
  {
    id: 'campus-002',
    cid: 'lawqa-campus-002',
    chapter: 'campus',
    question: '大学生做兼职被拖欠工资，可以劳动仲裁吗？',
    category: { type: 'qa-com', label: '问答' },
  },
  {
    id: 'campus-003',
    cid: 'lawqa-campus-003',
    chapter: 'campus',
    question: '毕业论文被同学抄袭，如何维权？',
    category: { type: 'qa-com', label: '问答' },
  },
  {
    id: 'campus-004',
    cid: 'lawqa-campus-004',
    chapter: 'campus',
    question: '在校实习受伤，算工伤吗？学校要负责吗？',
    category: { type: 'qa-com', label: '问答' },
  },

  /* ==================== 理财（已注释停用，保留数据以便恢复） ====================
  {
    id: 'finance-001',
    cid: 'lawqa-finance-001',
    chapter: 'finance',
    question: '银行理财经理承诺"保本保息"，亏损后能维权吗？',
    category: { type: 'qa-com', label: '问答' },
  },
  {
    id: 'finance-002',
    cid: 'lawqa-finance-002',
    chapter: 'finance',
    question: 'P2P 平台暴雷跑路，出借的钱还能要回来吗？',
    category: { type: 'qa-com', label: '问答' },
  },
  {
    id: 'finance-003',
    cid: 'lawqa-finance-003',
    chapter: 'finance',
    question: '基金亏损了，能要求基金公司赔偿吗？',
    category: { type: 'qa-com', label: '问答' },
  },
  {
    id: 'finance-004',
    cid: 'lawqa-finance-004',
    chapter: 'finance',
    question: '帮朋友投资理财，亏了钱要不要自己赔？',
    category: { type: 'qa-com', label: '问答' },
  },

  */
  // ==================== 职场 ====================
  {
    id: 'work-001',
    cid: 'lawqa-work-001',
    chapter: 'work',
    question: '试用期被随意辞退，公司说"不满意就可以不要"，合法吗？',
    category: { type: 'qa-com', label: '问答' },
  },
  {
    id: 'work-002',
    cid: 'lawqa-work-002',
    chapter: 'work',
    question: '公司要求签"竞业限制协议"但不给补偿金，有效吗？',
    category: { type: 'qa-com', label: '问答' },
  },
  {
    id: 'work-003',
    cid: 'lawqa-work-003',
    chapter: 'work',
    question: '周末加班没有加班费，只有调休，合法吗？',
    category: { type: 'qa-com', label: '问答' },
  },
  {
    id: 'work-004',
    cid: 'lawqa-work-004',
    chapter: 'work',
    question: '公司降薪逼我主动离职，能要赔偿吗？',
    category: { type: 'qa-com', label: '问答' },
  },

  // ==================== 消费 ====================
  {
    id: 'consume-001',
    cid: 'lawqa-consume-001',
    chapter: 'consume',
    question: '办的美容卡/健身卡老板跑路了，钱还能要回来吗？',
    category: { type: 'qa-com', label: '问答' },
  },
  {
    id: 'consume-002',
    cid: 'lawqa-consume-002',
    chapter: 'consume',
    question: '网购收到货不对板，商家坚持"不退不换"，怎么办？',
    category: { type: 'qa-com', label: '问答' },
  },
  {
    id: 'consume-003',
    cid: 'lawqa-consume-003',
    chapter: 'consume',
    question: '直播间买到假货，主播和平台有责任吗？',
    category: { type: 'qa-com', label: '问答' },
  },
  {
    id: 'consume-004',
    cid: 'lawqa-consume-004',
    chapter: 'consume',
    question: '餐厅吃出异物，除了免单还能要求赔偿吗？',
    category: { type: 'qa-com', label: '问答' },
  },

  // ==================== 保险 ====================
  {
    id: 'insurance-001',
    cid: 'lawqa-insurance-001',
    chapter: 'insurance',
    question: '保险公司以"未如实告知"拒赔，合理吗？',
    category: { type: 'qa-com', label: '问答' },
  },
  {
    id: 'insurance-002',
    cid: 'lawqa-insurance-002',
    chapter: 'insurance',
    question: '买了意外险，猝死算不算"意外"？',
    category: { type: 'qa-com', label: '问答' },
  },
  {
    id: 'insurance-003',
    cid: 'lawqa-insurance-003',
    chapter: 'insurance',
    question: '保单有"等待期"，等待期内生病不能赔吗？',
    category: { type: 'qa-com', label: '问答' },
  },
  {
    id: 'insurance-004',
    cid: 'lawqa-insurance-004',
    chapter: 'insurance',
    question: '保险公司拖了半年不给理赔款，合法吗？',
    category: { type: 'qa-com', label: '问答' },
  },

  // ==================== 其他 ====================
  {
    id: 'other-001',
    cid: 'lawqa-other-001',
    chapter: 'other',
    question: '个人信息被恶意泄露，能要求赔偿吗？',
    category: { type: 'qa-com', label: '问答' },
  },
  {
    id: 'other-002',
    cid: 'lawqa-other-002',
    chapter: 'other',
    question: '养狗不牵绳咬伤人，狗主人要负什么责任？',
    category: { type: 'qa-com', label: '问答' },
  },
  {
    id: 'other-003',
    cid: 'lawqa-other-003',
    chapter: 'other',
    question: '快递寄丢物品，只赔运费的 3 倍，合理吗？',
    category: { type: 'qa-com', label: '问答' },
  },
  {
    id: 'other-004',
    cid: 'lawqa-other-004',
    chapter: 'other',
    question: '楼下邻居装修砸承重墙，谁来管？',
    category: { type: 'qa-com', label: '问答' },
  },
];

// ==================== 回答/评论（label 链接到所属问题的 cid） ====================
export const LAW_QA_ANSWERS = [
  // ==================== 出行 ====================
  {
    id: 'ans-travel-001-1',
    category: { type: 'ans', label: 'lawqa-travel-001' },
    author: '网友',
    content: '小李从机场打车回市区，平时约 60 元。司机见他行李箱很多、对路线不熟，故意绕行高架环线，最终计价 118 元。司机还声称"堵车绕路很正常"。小李保留了下车时打印的发票和导航路线截图。',
  },
  {
    id: 'ans-travel-001-2',
    category: { type: 'ans', label: 'lawqa-travel-001' },
    author: '网友',
    content: '出租车/网约车司机故意绕路多收费，属于违约行为，侵害了乘客的公平交易权。乘客有权拒绝支付额外费用，并可要求承运人退还多收的费用。平台应承担先行赔付责任。',
  },
  {
    id: 'ans-travel-002-1',
    category: { type: 'ans', label: 'lawqa-travel-002' },
    author: '网友',
    content: '王先生乘飞机执行公务，航班因航空公司自身调配原因延误 6 小时，期间只提供了一瓶矿泉水。王先生因此错过了重要客户会议，造成经济损失。',
  },
  {
    id: 'ans-travel-002-2',
    category: { type: 'ans', label: 'lawqa-travel-002' },
    author: '网友',
    content: '因航空公司自身原因（如调配不当、机务维护等）导致航班延误，航空公司除应按约提供餐食、住宿等基本服务外，还应承担相应民事责任。若延误给旅客造成实际损失，旅客可主张赔偿。但天气等不可抗力原因导致的延误，航空公司一般不承担赔偿责任。',
  },
  {
    id: 'ans-travel-003-1',
    category: { type: 'ans', label: 'lawqa-travel-003' },
    author: '网友',
    content: '陈同学提前 15 天购买了高铁票，出行前一天因临时有事需要改签。铁路部门收取了票面价格 20% 的手续费，陈同学觉得不合理。',
  },
  {
    id: 'ans-travel-003-2',
    category: { type: 'ans', label: 'lawqa-travel-003' },
    author: '网友',
    content: '铁路旅客运输实行阶梯式退改签规则，这是运输企业经国家价格主管部门核准的收费规则。只要规则公开透明、提前公示，且旅客在购票时已明确知晓，即具有合同效力。但铁路部门也可以在规则范围内酌情免除或减免，旅客可与客服协商。',
  },
  {
    id: 'ans-travel-004-1',
    category: { type: 'ans', label: 'lawqa-travel-004' },
    author: '网友',
    content: '某共享单车平台推出"充值 100 元赠 50 元"活动，赵先生充值后仅骑行 3 次。此后平台宣布停止运营，App 既不能退款也不能提现，客服电话无人接听，押金 199 元也一直未退。',
  },
  {
    id: 'ans-travel-004-2',
    category: { type: 'ans', label: 'lawqa-travel-004' },
    author: '网友',
    content: '用户支付的押金和预充值余额属于用户的财产，平台停止运营应当依法退还。若平台明知经营困难仍大量吸收用户押金和充值款，甚至卷款跑路，可能涉嫌非法吸收公众存款或诈骗罪。用户可向市场监管部门和公安机关举报。',
  },

  /* ==================== 恋爱（已注释停用，保留数据以便恢复） ====================
  {
    id: 'ans-love-001-1',
    category: { type: 'ans', label: 'lawqa-love-001' },
    author: '网友',
    content: '小张和小刘恋爱两年，期间小张多次通过微信向小刘转账，包括"520""1314"等特殊金额红包，以及一笔 5 万元的"购房首付借款"。分手后小张要求小刘返还全部款项共计 8 万元。',
  },
  {
    id: 'ans-love-001-2',
    category: { type: 'ans', label: 'lawqa-love-001' },
    author: '网友',
    content: '恋爱期间的转账是否返还，关键在于转账性质。标注"520""1314"等具有特殊含义、金额较小的红包，通常认定为赠与，分手后无需返还。但明确约定为借款、或大额且以结婚为条件（彩礼性质）的转账，分手后可以要求返还。',
  },
  {
    id: 'ans-love-002-1',
    category: { type: 'ans', label: 'lawqa-love-002' },
    author: '网友',
    content: '小周按当地习俗向女友小林支付彩礼 18.8 万元，并购买黄金首饰（五金）约 4 万元。双方订婚 3 个月后因性格不合分手，未办理结婚登记。小周要求退还彩礼和首饰，小林认为"分手了男方也应该承担部分损失"。',
  },
  {
    id: 'ans-love-002-2',
    category: { type: 'ans', label: 'lawqa-love-002' },
    author: '网友',
    content: '双方未办理结婚登记手续，彩礼给付方请求返还按照习俗给付的彩礼，人民法院一般应予支持。具体返还数额需结合是否共同生活、生活时间长短、有无孕育子女、当地习俗等因素综合确定。五金首饰属于彩礼的组成部分，同样应当返还或折价补偿。',
  },
  {
    id: 'ans-love-003-1',
    category: { type: 'ans', label: 'lawqa-love-003' },
    author: '网友',
    content: '小林与男友分手后，前男友将两人恋爱期间拍摄的私密照片发布到微信群、朋友圈，并配文辱骂小林，导致小林遭受网络暴力，同事和亲友议论纷纷，小林精神压力极大。',
  },
  {
    id: 'ans-love-003-2',
    category: { type: 'ans', label: 'lawqa-love-003' },
    author: '网友',
    content: '未经他人同意发布私密照片，侵犯了他人的肖像权、隐私权和名誉权，属于违法行为。情节严重（浏览量 5000 次以上或不雅内容转发 500 次以上）的，构成传播淫秽物品罪，可追究刑事责任。同时可主张精神损害赔偿。',
  },
  {
    id: 'ans-love-004-1',
    category: { type: 'ans', label: 'lawqa-love-004' },
    author: '网友',
    content: '小林和小王恋爱期间共同出资购买一套商品房，小王出资 30% 且登记在自己名下，小林出资 70% 但未登记。首付款和月供部分从小林账户支付。分手后，小林要求确认自己享有 70% 份额，小王拒绝配合办理变更登记。',
  },
  {
    id: 'ans-love-004-2',
    category: { type: 'ans', label: 'lawqa-love-004' },
    author: '网友',
    content: '恋爱期间共同出资购房，即使只登记在一方名下，另一方若能证明出资事实，仍可主张共有权。法院会结合出资比例、登记情况、双方约定（有无书面协议）综合认定份额。仅有转账记录但无约定的，可能被认定为借款而非出资。',
  },

  */
  // ==================== 租房 ====================
  {
    id: 'ans-rental-001-1',
    category: { type: 'ans', label: 'lawqa-rental-001' },
    author: '网友',
    content: '小吴租住某小区一年，合同到期退租。交房时房东以"墙面有划痕""家具使用磨损""需重新粉刷"为由，扣留全部押金 3000 元。小吴入住时墙面本就有轻微划痕，且家具属于正常使用。',
  },
  {
    id: 'ans-rental-001-2',
    category: { type: 'ans', label: 'lawqa-rental-001' },
    author: '网友',
    content: '押金是担保承租人履行合同义务的保证金，仅用于抵扣承租人拖欠的租金、物业费或因承租人过错造成的损失。房屋的正常使用损耗（自然磨损）属于房东应承担的经营成本，不能要求承租人赔偿。房东以不合理理由扣押金是违约行为。',
  },
  {
    id: 'ans-rental-002-1',
    category: { type: 'ans', label: 'lawqa-rental-002' },
    author: '网友',
    content: '小赵与房东签订 2 年租赁合同，合同还剩 8 个月时，房东将房屋出售给他人。新房东以"我不是原出租人，你和原房东的合同与我没有关系"为由，要求小赵 15 天内搬走。',
  },
  {
    id: 'ans-rental-002-2',
    category: { type: 'ans', label: 'lawqa-rental-002' },
    author: '网友',
    content: '法律规定"买卖不破租赁"：房屋所有权的转移不影响租赁合同的效力。新房东必须继续履行原租赁合同直至期满。同时，原承租人在同等条件下享有优先购买权，若房东未通知承租人即出售房屋，承租人可主张赔偿或请求确认买卖因侵害优先购买权而无效（需在法定期限内行使）。',
  },
  {
    id: 'ans-rental-003-1',
    category: { type: 'ans', label: 'lawqa-rental-003' },
    author: '网友',
    content: '小孙与人合租两居室，室友经常凌晨 2 点带朋友回来打游戏、唱歌，噪音严重。多次沟通无效，房东也调解无效。小孙想退租，房东以"合同未到期"拒绝退还押金，室友也拒绝承担任何责任。',
  },
  {
    id: 'ans-rental-003-2',
    category: { type: 'ans', label: 'lawqa-rental-003' },
    author: '网友',
    content: '承租人能否单方解除合同，取决于合同有无约定或是否存在法定解除事由。合租中其他租户的噪音干扰严重影响居住安宁的，属于租赁合同目的无法实现。但实践中法院一般要求承租人先履行告知、催告义务，并给予合理整改期限。若合同明确约定"噪音扰民可解约"，则直接适用。',
  },
  {
    id: 'ans-rental-004-1',
    category: { type: 'ans', label: 'lawqa-rental-004' },
    author: '网友',
    content: '小钱刚毕业租住一套新装修的公寓，入住一周后出现头晕、嗓子疼。自购甲醛检测仪显示甲醛超标 3 倍，第三方检测机构也确认超标。房东认为"通风一段时间就好"，拒绝退租。',
  },
  {
    id: 'ans-rental-004-2',
    category: { type: 'ans', label: 'lawqa-rental-004' },
    author: '网友',
    content: '出租房屋甲醛超标，危及承租人身体健康，属于出租人未提供符合约定用途和安全标准的租赁物，构成根本违约。承租人有权解除合同并要求退还押金、租金，还可主张因退租搬家的损失和检测费用。甲醛超标严重的，可追究房东侵权责任。',
  },

  // ==================== 校园 ====================
  {
    id: 'ans-campus-001-1',
    category: { type: 'ans', label: 'lawqa-campus-001' },
    author: '网友',
    content: '大学生小谢为买最新款手机，在网贷平台借款 1 万元，实际到账仅 8000 元（扣除所谓"服务费"），月息高达 8%。3 个月后债务滚到 1.7 万元，平台威胁将骚扰其同学和家人。',
  },
  {
    id: 'ans-campus-001-2',
    category: { type: 'ans', label: 'lawqa-campus-001' },
    author: '网友',
    content: '超过法定利率上限的利息不受法律保护。按照现行规定，民间借贷利率司法保护上限为合同成立时一年期 LPR 的 4 倍。同时，预先扣除利息（砍头息）的，本金按实际到账金额计算。违规校园贷平台还通过暴力催收、骚扰他人等方式催债的，涉嫌违法甚至犯罪。',
  },
  {
    id: 'ans-campus-002-1',
    category: { type: 'ans', label: 'lawqa-campus-002' },
    author: '网友',
    content: '大二学生小林在一家奶茶店做兼职，口头约定每小时 20 元，每周工作 20 小时。做了 2 个月后，老板以"你是学生，不是正式员工"为由，只发了 1 个月工资，另外 1 个月工资 1600 元拒不支付。',
  },
  {
    id: 'ans-campus-002-2',
    category: { type: 'ans', label: 'lawqa-campus-002' },
    author: '网友',
    content: '大学生在校期间从事勤工助学，与用工单位形成的是劳务关系而非劳动关系（全日制在校学生利用业余时间勤工助学不认定为劳动关系）。因此，拖欠工资一般不适用劳动仲裁程序（部分地区有例外），但可以依据劳务合同主张劳务报酬，向法院起诉或要求单位支付。',
  },
  {
    id: 'ans-campus-003-1',
    category: { type: 'ans', label: 'lawqa-campus-003' },
    author: '网友',
    content: '研究生小陈将自己的毕业论文初稿发给室友"帮忙修改"，室友竟然直接用作自己毕业论文的核心章节，并在答辩时被导师发现重复率极高。学校调查后认定两人均存在学术不端，小陈的论文也被要求重新撰写。',
  },
  {
    id: 'ans-campus-003-2',
    category: { type: 'ans', label: 'lawqa-campus-003' },
    author: '网友',
    content: '论文属于著作权法保护的作品，未经许可抄袭、剽窃他人作品，侵犯他人著作权。同时，论文抄袭也是学术不端行为，学校有权根据学术规范对抄袭者作出处分，但被抄袭者本人不应因此承担不利后果。被抄袭者可以要求抄袭者停止侵害、赔礼道歉、赔偿损失。',
  },
  {
    id: 'ans-campus-004-1',
    category: { type: 'ans', label: 'lawqa-campus-004' },
    author: '网友',
    content: '大四学生小徐经学校统一安排到某工厂实习，操作机器时手指被卷入设备，造成骨折。工厂认为小徐是学生，"没有劳动关系，不算工伤"；学校认为实习是工厂安排的，"责任在工厂"。双方互相推诿。',
  },
  {
    id: 'ans-campus-004-2',
    category: { type: 'ans', label: 'lawqa-campus-004' },
    author: '网友',
    content: '在校学生到单位实习发生事故伤害，一般不被认定为工伤（因不构成劳动关系），但可以依据最高人民法院相关司法解释和司法实践，按照民事侵权关系向用人单位主张损害赔偿。学校未尽到安全教育、管理、保护职责的，也应承担相应责任。实习单位未尽安全保障义务的，承担主要赔偿责任。',
  },

  /* ==================== 理财（已注释停用，保留数据以便恢复） ====================
  {
    id: 'ans-finance-001-1',
    category: { type: 'ans', label: 'lawqa-finance-001' },
    author: '网友',
    content: '刘阿姨在银行购买理财产品时，理财经理口头承诺"这个产品保证 5% 收益，稳赚不赔"。刘阿姨将 20 万元存款全部买入，1 年后产品亏损 15%，本金只剩 17 万元。刘阿姨要求银行赔偿。',
  },
  {
    id: 'ans-finance-001-2',
    category: { type: 'ans', label: 'lawqa-finance-001' },
    author: '网友',
    content: '监管规定明确禁止金融机构及其从业人员承诺保本保息或最低收益。理财经理的违规承诺虽不能作为合同内容，但银行未尽到"了解客户、了解产品、适当性匹配"义务，未充分揭示风险的，需要承担相应赔偿责任。司法实践中，银行因"卖者尽责"不足被判赔偿部分损失的案例很多。',
  },
  {
    id: 'ans-finance-002-1',
    category: { type: 'ans', label: 'lawqa-finance-002' },
    author: '网友',
    content: '王先生在某 P2P 网贷平台投资 15 万元，平台宣称"年化 12%，银行存管，安全可靠"。半年后平台突然关闭，老板失联，App 无法登录，联系客服无人应答。王先生查询发现该平台并无银行存管资质。',
  },
  {
    id: 'ans-finance-002-2',
    category: { type: 'ans', label: 'lawqa-finance-002' },
    author: '网友',
    content: 'P2P 平台暴雷有以下几种处理路径：① 平台涉嫌非法吸收公众存款或集资诈骗犯罪的，由公安机关立案侦查并追缴赃款，出借人按比例受偿；② 平台正常退出转型的，由清退组按兑付方案分期兑付；③ 投资人可通过民事诉讼要求平台及担保方承担还款责任。',
  },
  {
    id: 'ans-finance-003-1',
    category: { type: 'ans', label: 'lawqa-finance-003' },
    author: '网友',
    content: '孙先生通过某平台购买了一只股票型基金，平台页面标注"历史业绩 20%+"。孙先生未阅读基金合同即买入 10 万元，3 个月后基金净值下跌 25%。孙先生认为平台虚假宣传。',
  },
  {
    id: 'ans-finance-003-2',
    category: { type: 'ans', label: 'lawqa-finance-003' },
    author: '网友',
    content: '基金属于风险投资品种，净值波动是正常现象，基金公司并不承诺保本。能否索赔关键在于：① 基金公司在销售时是否夸大宣传、未充分揭示风险；② 是否准确匹配投资者风险等级。若孙先生属于低风险承受能力投资者，而平台销售了高风险产品，则平台存在适当性义务违规。若孙先生已进行风险测评并被确认匹配，则需自担风险。',
  },
  {
    id: 'ans-finance-004-1',
    category: { type: 'ans', label: 'lawqa-finance-004' },
    author: '网友',
    content: '小李是金融专业毕业生，朋友小刘出资 10 万元请他代为理财，口头约定"赚了分你 20%"。小李买入某股票后亏损 3 万元，小刘要求小李补上亏损，小李觉得自己"只是帮忙"。',
  },
  {
    id: 'ans-finance-004-2',
    category: { type: 'ans', label: 'lawqa-finance-004' },
    author: '网友',
    content: '受托理财属于委托合同关系。受托人按照委托人指示处理事务，除非存在故意或重大过失，否则不对委托事务的损失承担责任。投资理财本身就是高风险行为，正常市场波动造成的亏损不属于受托人过错。但若受托人"承诺保本""擅自挪用资金""恶意操作"，则需承担赔偿责任。',
  },

  */
  // ==================== 职场 ====================
  {
    id: 'ans-work-001-1',
    category: { type: 'ans', label: 'lawqa-work-001' },
    author: '网友',
    content: '小吴入职某公司担任运营专员，试用期 3 个月。第 2 个月末，HR 突然通知他"试用期不合格，明天不用来上班了"，未出具任何书面考核标准和考核结果。小吴工作期间表现正常，没有任何过错。',
  },
  {
    id: 'ans-work-001-2',
    category: { type: 'ans', label: 'lawqa-work-001' },
    author: '网友',
    content: '用人单位在试用期解除劳动合同，必须有充分证据证明劳动者"不符合录用条件"，且录用条件应当在入职时明确告知。仅凭一句"不满意"就解除合同属于违法解除，劳动者有权要求继续履行合同或主张赔偿金（2 倍经济补偿）。',
  },
  {
    id: 'ans-work-002-1',
    category: { type: 'ans', label: 'lawqa-work-002' },
    author: '网友',
    content: '小陈在某互联网公司任前端工程师，入职时被迫签署竞业限制协议，约定离职后 2 年内不得在同行业公司工作，否则赔偿 50 万元。但协议未约定竞业限制补偿金。小陈离职后多次求职受挫，原公司也未支付任何补偿。',
  },
  {
    id: 'ans-work-002-2',
    category: { type: 'ans', label: 'lawqa-work-002' },
    author: '网友',
    content: '竞业限制协议有效的前提是：① 劳动者属于高级管理人员、高级技术人员和其他负有保密义务的人员；② 用人单位按月支付经济补偿（不低于离职前 12 个月平均工资的 30%，且不低于当地最低工资标准）。未约定补偿金并非协议当然无效，但劳动者有权要求公司支付补偿；公司连续 3 个月不支付的，劳动者可以解除竞业限制协议。',
  },
  {
    id: 'ans-work-003-1',
    category: { type: 'ans', label: 'lawqa-work-003' },
    author: '网友',
    content: '小周所在公司实行标准工时制，经常安排员工周末加班。公司规定"周末加班一律调休，不支付加班费"，但调休申请流程繁琐，年底还被强制清零。小周一年累计加班 300 多小时，调休不足 10 天。',
  },
  {
    id: 'ans-work-003-2',
    category: { type: 'ans', label: 'lawqa-work-003' },
    author: '网友',
    content: '标准工时制下，休息日加班应优先安排补休；不能安排补休的，应支付不低于工资 200% 的加班费。法定节假日加班则必须支付 300% 加班费，不能以调休替代。公司"调休强制清零"的规定无效，劳动者有权主张未调休部分的加班费。',
  },
  {
    id: 'ans-work-004-1',
    category: { type: 'ans', label: 'lawqa-work-004' },
    author: '网友',
    content: '某公司因经营困难，未经协商将员工小马的月薪从 15000 元降至 9000 元，并调整岗位。小马拒绝接受后，公司 HR 暗示"不签降薪协议就自己辞职"。小马每月工资被实际按 9000 元发放。',
  },
  {
    id: 'ans-work-004-2',
    category: { type: 'ans', label: 'lawqa-work-004' },
    author: '网友',
    content: '变更劳动合同约定的薪酬、岗位，须与劳动者协商一致并采用书面形式。公司单方降薪属于变更劳动合同内容，劳动者未同意的，降薪行为不发生法律效力。劳动者被迫"主动辞职"的，可以依据劳动合同法第 38 条提出解除并主张经济补偿。关键在于收集"被迫"的证据（降薪通知、沟通记录、工资条差额）。',
  },

  // ==================== 消费 ====================
  {
    id: 'ans-consume-001-1',
    category: { type: 'ans', label: 'lawqa-consume-001' },
    author: '网友',
    content: '刘女士在某美容院充值 2 万元办理年卡，3 个月后美容院突然关门，老板失联。刘女士卡内还剩 1.6 万元未消费。查询发现该美容院一个月前已注销营业执照。',
  },
  {
    id: 'ans-consume-001-2',
    category: { type: 'ans', label: 'lawqa-consume-001' },
    author: '网友',
    content: '经营者以预收款方式提供服务后跑路，属于严重违约。若老板以非法占有为目的、明知无法继续经营仍大量办卡收款，可能涉嫌集资诈骗或普通诈骗罪。即使不构成犯罪，工商登记的经营者（个人独资企业投资人/公司股东，尤其是未清算即注销的）也应在出资范围内承担清偿责任。',
  },
  {
    id: 'ans-consume-002-1',
    category: { type: 'ans', label: 'lawqa-consume-002' },
    author: '网友',
    content: '小郑在某电商平台花 3000 元购买某品牌手机，收货后发现是山寨机，外包装、标识均与正品明显不符。商家称"特价商品，概不退换"。小郑申请平台介入，商家拒绝退货退款。',
  },
  {
    id: 'ans-consume-002-2',
    category: { type: 'ans', label: 'lawqa-consume-002' },
    author: '网友',
    content: '商家销售与描述不符的商品构成违约，且"特价商品概不退换"属于典型的格式条款，排除了消费者依法享有的权利，该条款无效。此外，以假充真、以次充好的，构成欺诈，消费者可主张"退一赔三"（增加赔偿金额不足 500 元的按 500 元计算）。',
  },
  {
    id: 'ans-consume-003-1',
    category: { type: 'ans', label: 'lawqa-consume-003' },
    author: '网友',
    content: '小姜在某直播间看到主播激情推荐一款"原价 2999 元、直播价 599 元"的名牌手表，主播反复强调"正品保障、假一赔十"。收货后发现手表为高仿品。主播以"我是替商家带货的"为由拒绝负责，平台也仅提示"联系商家处理"。',
  },
  {
    id: 'ans-consume-003-2',
    category: { type: 'ans', label: 'lawqa-consume-003' },
    author: '网友',
    content: '主播在直播中明示其为商家带货并作出承诺的，构成广告代言人或经营者身份，需对虚假宣传承担连带责任。若主播为自己的商品带货，则直接是经营者。平台明知或应知商家侵害消费者权益而未采取必要措施的，承担连带责任。"假一赔十"承诺属于单方允诺，具有法律约束力。',
  },
  {
    id: 'ans-consume-004-1',
    category: { type: 'ans', label: 'lawqa-consume-004' },
    author: '网友',
    content: '小何在某餐厅用餐时，在菜中发现一只蟑螂。餐厅经理表示"这桌给你们免单"，但拒绝其他赔偿。小何当晚出现腹泻，去医院诊断为急性肠胃炎，花费医疗费 400 元。',
  },
  {
    id: 'ans-consume-004-2',
    category: { type: 'ans', label: 'lawqa-consume-004' },
    author: '网友',
    content: '餐厅提供不符合食品安全标准的食品，消费者除要求赔偿损失外，还可以向生产者或经营者要求支付价款十倍或者损失三倍的赔偿金，且最低赔偿 1000 元。食物中毒造成的医疗费、误工费等实际损失也应赔偿。',
  },

  // ==================== 保险 ====================
  {
    id: 'ans-insurance-001-1',
    category: { type: 'ans', label: 'lawqa-insurance-001' },
    author: '网友',
    content: '吴先生投保重疾险前 3 个月曾因高血压就诊并服药，投保时业务员询问"是否有高血压病史"，吴先生回答"没有"。2 年后吴先生确诊肺癌，保险公司调查发现其门诊记录，以"未如实告知"为由拒赔并解除合同。',
  },
  {
    id: 'ans-insurance-001-2',
    category: { type: 'ans', label: 'lawqa-insurance-001' },
    author: '网友',
    content: '投保人故意或因重大过失未如实告知，足以影响保险人决定是否承保或提高费率的，保险人有权解除合同并不承担赔偿责任。但需注意：① 保险公司必须在知道解除事由之日起 30 日内行使解除权，超过 2 年（不可抗辩期）不得解除；② 未如实告知内容与保险事故之间无因果关系的，不必然拒赔；③ 保险业务员代填告知内容、诱导隐瞒的，投保人不担责。',
  },
  {
    id: 'ans-insurance-002-1',
    category: { type: 'ans', label: 'lawqa-insurance-002' },
    author: '网友',
    content: '陈先生购买了一份综合意外险，条款约定"意外伤害是指外来的、突发的、非本意的、非疾病的客观事件直接致使身体受到的伤害"。陈先生加班时突然倒地，送医抢救无效死亡，死亡原因为"心源性猝死"（基础病为冠心病）。保险公司以"猝死属疾病，不属于意外"为由拒赔。',
  },
  {
    id: 'ans-insurance-002-2',
    category: { type: 'ans', label: 'lawqa-insurance-002' },
    author: '网友',
    content: '保险实务中，猝死是否属于意外险赔付范围，关键看保险合同是否将"猝死"明确列为保障责任。通常普通意外险条款将猝死排除在意外之外（因猝死多由潜在疾病引发）。若投保的是含"猝死保障"的意外险，则可获赔。投保时被保险人在保险事故发生时患有条款约定除外疾病的，保险公司可拒赔。',
  },
  {
    id: 'ans-insurance-003-1',
    category: { type: 'ans', label: 'lawqa-insurance-003' },
    author: '网友',
    content: '张女士购买了一份医疗险，合同约定"等待期 90 天"。第 70 天，张女士因急性阑尾炎住院手术，花费 1.5 万元。申请理赔时，保险公司以"等待期内出险"为由拒赔，仅退还保费。',
  },
  {
    id: 'ans-insurance-003-2',
    category: { type: 'ans', label: 'lawqa-insurance-003' },
    author: '网友',
    content: '等待期（观察期）是保险条款中常见的约定，旨在防止带病投保。等待期内发生的保险事故，保险公司一般不予赔付（但合同中通常会约定等待期内发生特定疾病退保费）。需要注意的是，等待期的起算和"出险"的认定标准（是确诊日还是首次就诊日）可能影响理赔结果，应结合具体条款和证据判断。',
  },
  {
    id: 'ans-insurance-004-1',
    category: { type: 'ans', label: 'lawqa-insurance-004' },
    author: '网友',
    content: '赵先生因交通事故受伤住院，向保险公司提交了完整理赔材料。保险公司以"材料需补充""案件需调查"为由拖延，6 个月后仍未给出结论，赵先生医疗费和误工损失越来越大。',
  },
  {
    id: 'ans-insurance-004-2',
    category: { type: 'ans', label: 'lawqa-insurance-004' },
    author: '网友',
    content: '保险人收到被保险人或者受益人的赔偿或者给付保险金的请求后，应当及时作出核定；情形复杂的，应当在三十日内作出核定（合同另有约定的除外）。达成赔偿协议的，应在 10 日内履行赔偿义务。保险公司无故拖延，不仅要支付保险金，还应赔偿由此造成的损失（一般按银行同期贷款利率计算利息）。',
  },

  // ==================== 其他 ====================
  {
    id: 'ans-other-001-1',
    category: { type: 'ans', label: 'lawqa-other-001' },
    author: '网友',
    content: '郑先生在某培训机构登记了姓名、手机号、住址。随后频繁收到各类推销电话和短信，还发现自己的快递信息被内部员工倒卖。郑先生要求培训机构承担责任并赔偿。',
  },
  {
    id: 'ans-other-001-2',
    category: { type: 'ans', label: 'lawqa-other-001' },
    author: '网友',
    content: '个人信息受法律保护。经营者收集个人信息后应依法妥善保管，未经同意不得向第三方提供。信息泄露给个人造成实际损失或严重精神损害的，可主张赔偿。监管部门也可对违法处理个人信息的机构进行处罚。',
  },
  {
    id: 'ans-other-002-1',
    category: { type: 'ans', label: 'lawqa-other-002' },
    author: '网友',
    content: '王阿姨在小区遛狗未拴绳，小狗突然冲出去咬伤了正在散步的小孩，孩子腿部受伤，治疗花费 1800 元。狗主人王阿姨表示"我的狗平时很乖，从来没咬过人"，拒绝全额赔偿。',
  },
  {
    id: 'ans-other-002-2',
    category: { type: 'ans', label: 'lawqa-other-002' },
    author: '网友',
    content: '饲养动物造成他人损害的，动物饲养人或者管理人应当承担侵权责任（无过错责任）。即使动物平时温顺，只要造成损害，饲养人一般都要赔偿。若小孩存在故意挑逗或重大过失，可减轻饲养人责任，但遛狗未拴绳违反养犬管理规定，一般难以减轻责任。',
  },
  {
    id: 'ans-other-003-1',
    category: { type: 'ans', label: 'lawqa-other-003' },
    author: '网友',
    content: '小林通过某快递公司寄送价值 8000 元的笔记本电脑，未保价。运输途中包裹丢失。快递公司表示按运单条款"未保价快件按运费 3 倍赔偿"，只赔 60 元。',
  },
  {
    id: 'ans-other-003-2',
    category: { type: 'ans', label: 'lawqa-other-003' },
    author: '网友',
    content: '快递公司以未保价为由仅按运费 3 倍赔偿，长期以来存在争议。法院裁判思路：① 快递单上的限赔条款属于格式条款，若快递公司未尽合理提示和说明义务，该条款不生效，按实际损失赔偿；② 即使条款有效，若快递丢失是因快递公司故意或重大过失造成，限赔条款也无效；③ 寄件人可主张按《快递暂行条例》和《民法典》承运人责任赔偿实际损失。各地裁判结果不一，多数支持按实际价值赔偿（需证明物品价值）。',
  },
  {
    id: 'ans-other-004-1',
    category: { type: 'ans', label: 'lawqa-other-004' },
    author: '网友',
    content: '马先生所在小区一楼的邻居装修时，擅自拆除房屋承重墙，马先生担心整栋楼安全。物业公司劝阻无效，装修仍在继续。',
  },
  {
    id: 'ans-other-004-2',
    category: { type: 'ans', label: 'lawqa-other-004' },
    author: '网友',
    content: '擅自变动房屋建筑主体和承重结构，违反《建设工程质量管理条例》和《住宅室内装饰装修管理办法》，属于违法行为，可处 5 万-10 万元罚款。造成楼体安全隐患的，应承担恢复原状和赔偿责任。物业、业主均可向住建部门举报，紧急情况下可报警或向法院申请诉前保全。',
  },
];

// ==================== 建议（label 链接到所属问题的 cid） ====================
export const LAW_QA_SUGGESTIONS = [
  // ==================== 出行 ====================
  { id: 'sug-travel-001', category: { type: 'sug', label: 'lawqa-travel-001' }, content: '① 立即通过平台投诉并申请退差价；② 保存发票、行车路线截图、付款记录；③ 向交通运输管理部门（12328）或消费者协会投诉；④ 协商不成可向法院起诉，主张退还多收费用并赔偿损失。' },
  { id: 'sug-travel-002', category: { type: 'sug', label: 'lawqa-travel-002' }, content: '① 要求航空公司出具延误证明（写明延误原因）；② 因自身原因延误可主张赔偿，因天气等不可抗力延误可主张退改签及食宿安排；③ 保存登机牌、延误通知、消费凭证；④ 向民航局消费者事务中心（12326）投诉，或起诉航空公司。' },
  { id: 'sug-travel-003', category: { type: 'sug', label: 'lawqa-travel-003' }, content: '① 购票前仔细阅读 12306 退改签规则，了解各时段手续费比例；② 因铁路部门原因（如列车停运、晚点）退改签的，不收取手续费；③ 保留购票及退改凭证，若对收费有异议可拨打 12306 客服或向铁路监管部门反映；④ 大额纠纷可通过诉讼解决。' },
  { id: 'sug-travel-004', category: { type: 'sug', label: 'lawqa-travel-004' }, content: '① 截图保存充值记录、押金支付凭证、App 公告；② 整理好证据后向当地市场监督管理局投诉举报；③ 涉及大量用户的，可集体诉讼或向公安机关报案；④ 通过 12315 平台、人民法院在线服务小程序提交投诉或起诉。' },

  /* ==================== 恋爱（已注释停用，保留数据以便恢复） ====================
  { id: 'sug-love-001', category: { type: 'sug', label: 'lawqa-love-001' }, content: '① 分手后先梳理转账记录，区分"特殊含义红包""购物代付""借款"等不同性质；② 若主张借款，需提供借条、聊天记录中明确"借款"意思表示的证据；③ 大额转账建议书面约定用途，避免"赠与"与"借贷"之争；④ 协商不成可起诉，注意保存完整的转账凭证和聊天记录。' },
  { id: 'sug-love-002', category: { type: 'sug', label: 'lawqa-love-002' }, content: '① 明确彩礼范围：大额现金、首饰、房产等均属彩礼；② 保存彩礼支付凭证（转账记录、发票、收据）；③ 协商时合理考虑共同生活时长和支出；④ 协商不成可通过法院诉讼，注意 3 年诉讼时效。' },
  { id: 'sug-love-003', category: { type: 'sug', label: 'lawqa-love-003' }, content: '① 立即对相关页面截图、录屏、保存链接，固定证据；② 要求社交平台删除侵权内容；③ 向公安机关报警，要求治安处罚；④ 向法院起诉，主张停止侵害、赔礼道歉、赔偿精神损害；⑤ 情节严重构成犯罪的，刑事报案。' },
  { id: 'sug-love-004', category: { type: 'sug', label: 'lawqa-love-004' }, content: '① 保留出资凭证：银行转账记录、首付凭证、月供扣款记录；② 补签书面协议明确出资比例和产权归属；③ 协商不成，向法院提起共有物分割之诉，要求确认份额并协助过户；④ 若对方拒不配合，可申请强制执行。' },

  */
  // ==================== 租房 ====================
  { id: 'sug-rental-001', category: { type: 'sug', label: 'lawqa-rental-001' }, content: '① 签约时对所有瑕疵拍照录像留底，交房时再逐一核对；② 合同明确押金返还条件和期限（如交房后 7 日内）；③ 房东无理扣押的，书面催告后向住建部门投诉（12345）；④ 小额纠纷可申请法院小额诉讼程序，诉讼费用低、审理快。' },
  { id: 'sug-rental-002', category: { type: 'sug', label: 'lawqa-rental-002' }, content: '① 向新房东出示租赁合同，明确"买卖不破租赁"；② 若新房东强行要求搬离，可拒绝并报警处理；③ 保留租赁合同、租金支付凭证、过户记录；④ 协商无果可起诉要求继续履行合同或主张违约赔偿。' },
  { id: 'sug-rental-003', category: { type: 'sug', label: 'lawqa-rental-003' }, content: '① 先书面告知室友停止扰民并留存证据（录音、录像、物业/居委会调解记录）；② 向房东书面催告要求解决；③ 协商退租时与房东达成书面解约协议，明确押金返还金额；④ 必要时报警处理噪音问题，或起诉要求解除合同并返还押金。' },
  { id: 'sug-rental-004', category: { type: 'sug', label: 'lawqa-rental-004' }, content: '① 请有 CMA 资质的第三方检测机构出具检测报告（自购仪器结果效力有限）；② 保留就医记录、检测报告、聊天记录；③ 书面通知房东解除合同并要求退款；④ 协商不成可向住建部门投诉或起诉，主张检测费、搬家费、违约金等损失。' },

  // ==================== 校园 ====================
  { id: 'sug-campus-001', category: { type: 'sug', label: 'lawqa-campus-001' }, content: '① 立即停止向平台还款，保存全部借款合同、转账记录、催收记录；② 只还合法本金和法定利息，超出部分依法拒绝；③ 遭遇暴力催收、威胁骚扰的，立即报警；④ 向学校学生资助部门、银保监局、12315 投诉举报；⑤ 校园贷陷阱导致精神损害的，可起诉主张赔偿。' },
  { id: 'sug-campus-002', category: { type: 'sug', label: 'lawqa-campus-002' }, content: '① 尽量签订书面兼职协议，明确报酬标准、结算周期；② 保留排班表、工作群记录、转账记录等证据；③ 拖欠工资的，向用人单位所在地劳动监察部门投诉（在校生可尝试）；④ 协商不成可起诉至法院，标的额小的可申请小额诉讼，一审终审。' },
  { id: 'sug-campus-003', category: { type: 'sug', label: 'lawqa-campus-003' }, content: '① 第一时间固定证据：原始文档的修改记录（Word 版本历史）、邮件/网盘时间戳、聊天记录；② 向学校学术委员会举报，要求启动学术不端调查；③ 可要求抄袭者书面道歉并在相应范围消除影响；④ 情节严重的，可向法院提起著作权侵权之诉。' },
  { id: 'sug-campus-004', category: { type: 'sug', label: 'lawqa-campus-004' }, content: '① 保留实习协议、考勤记录、事故现场照片、就医记录；② 先与实习单位、学校协商赔偿（医疗费、误工费、护理费、残疾赔偿金）；③ 协商不成向实习单位所在地法院提起人身损害赔偿诉讼；④ 建议实习前购买意外伤害保险，降低风险。' },

  /* ==================== 理财（已注释停用，保留数据以便恢复） ====================
  { id: 'sug-finance-001', category: { type: 'sug', label: 'lawqa-finance-001' }, content: '① 保存理财经理承诺的录音、微信聊天记录、宣传材料；② 查询自己购买理财产品时填写的风险测评问卷；③ 向银行业监督管理机构投诉；④ 起诉银行主张赔偿，重点论证银行未尽适当性义务和风险揭示义务。' },
  { id: 'sug-finance-002', category: { type: 'sug', label: 'lawqa-finance-002' }, content: '① 立即整理：电子合同、转账记录、银行流水、平台截图；② 向公司所在地公安机关经济犯罪侦查部门报案；③ 关注法院/公安发布的信息登记公告，及时申报债权；④ 刑事案件追缴的赃款按比例返还，部分损失无法追回是常见情况；⑤ 切勿轻信"内部通道能全额追回"的骗局。' },
  { id: 'sug-finance-003', category: { type: 'sug', label: 'lawqa-finance-003' }, content: '① 核查销售页面、聊天记录中是否存在"稳赚""保本"等违规承诺；② 查看自己购买时的风险测评结果与产品风险等级是否匹配；③ 向证监会（12386）投诉举报；④ 起诉索赔需围绕"适当性义务违反"和"虚假宣传"两个核心展开举证。' },
  { id: 'sug-finance-004', category: { type: 'sug', label: 'lawqa-finance-004' }, content: '① 朋友间代客理财务必签订书面委托协议，明确权限、费用、风险承担；② 保留每笔交易记录、投资决策沟通记录；③ 亏损后协商解决，说明市场风险而非个人过错；④ 若自己乱操作导致巨亏，应主动协商赔偿部分损失，避免诉讼。' },

  */
  // ==================== 职场 ====================
  { id: 'sug-work-001', category: { type: 'sug', label: 'lawqa-work-001' }, content: '① 要求公司出具书面解除通知，写明解除理由和依据；② 若公司无法提供"不符合录用条件"的证据，构成违法解除；③ 收集录用通知、绩效考核文件、工资记录、解除通知等证据；④ 申请劳动仲裁，主张 2 倍经济赔偿金。' },
  { id: 'sug-work-002', category: { type: 'sug', label: 'lawqa-work-002' }, content: '① 入职前仔细审查竞业限制条款，要求明确补偿标准；② 离职后若履行了竞业限制义务，按月向原公司主张补偿；③ 公司 3 个月不支付补偿的，书面通知解除竞业限制协议；④ 被起诉索赔的，可从职务层级、保密范围、补偿缺失等角度抗辩。' },
  { id: 'sug-work-003', category: { type: 'sug', label: 'lawqa-work-003' }, content: '① 保存考勤记录、加班审批单、工作邮件/聊天记录、工资流水；② 计算应得加班费，通过书面形式向公司提出；③ 协商不成，向劳动监察部门投诉或申请劳动仲裁（注意仲裁时效 1 年）；④ 加班费举证责任：公司掌握考勤记录却不提供的，劳动者可主张以自己记录为准。' },
  { id: 'sug-work-004', category: { type: 'sug', label: 'lawqa-work-004' }, content: '① 明确书面表示不同意降薪，留存聊天记录；② 每月核对工资条，将差额部分截图保存；③ 不要签任何"自愿离职"文件；④ 以"未足额支付劳动报酬"为由书面解除合同，主张经济补偿金（每满一年一个月工资）；⑤ 及时申请劳动仲裁，避免超过 1 年仲裁时效。' },

  // ==================== 消费 ====================
  { id: 'sug-consume-001', category: { type: 'sug', label: 'lawqa-consume-001' }, content: '① 保存充值记录、合同/收据、门店照片、余额截图；② 到当地市场监管局投诉（12315），查询经营者信息；③ 公司已注销的，可起诉股东要求其承担清偿责任；④ 涉案金额大、人数多的，向公安机关报案；⑤ 预付消费前留意商家经营状况，避免大额充值。' },
  { id: 'sug-consume-002', category: { type: 'sug', label: 'lawqa-consume-002' }, content: '① 保留订单截图、商品详情页、与商家聊天记录、开箱视频；② 先通过平台介入申请退货退款；③ 认定欺诈的，可向"退一赔三"方向主张；④ 平台处理不了的，向 12315 投诉或起诉商家及平台。' },
  { id: 'sug-consume-003', category: { type: 'sug', label: 'lawqa-consume-003' }, content: '① 录屏直播回放，截取主播承诺"正品""假一赔十"的画面；② 保存订单信息、支付凭证、开箱视频；③ 先向电商平台投诉举报；④ 可同时起诉商家、主播、平台，要求退一赔三（欺诈）或按"假一赔十"承诺赔偿；⑤ 将涉嫌违法线索移送市场监管部门、网信部门。' },
  { id: 'sug-consume-004', category: { type: 'sug', label: 'lawqa-consume-004' }, content: '① 第一时间对异物拍照、录像，保留实物（可用保鲜袋装好）；② 保存当餐小票、支付记录、就医病历和发票；③ 与餐厅协商：免单 + 十倍赔偿（不足 1000 元按 1000 元）+ 医疗费；④ 协商不成拨打 12315 投诉或向法院起诉；⑤ 向市场监管部门举报，可获食品安全违法行为线索奖励。' },

  // ==================== 保险 ====================
  { id: 'sug-insurance-001', category: { type: 'sug', label: 'lawqa-insurance-001' }, content: '① 查看投保时的健康告知问卷记录及签字；② 若体检报告、病历中无相关记录或业务员代为勾选，可主张未违反如实告知义务；③ 确认拒赔与未告知事项无因果关系的（如高血压与肺癌），请求继续赔付；④ 保险公司超期解约的，可主张解约无效；⑤ 协商不成申请调解或提起诉讼。' },
  { id: 'sug-insurance-002', category: { type: 'sug', label: 'lawqa-insurance-002' }, content: '① 仔细查看保险合同条款中"意外伤害"定义和免责条款；② 收集死亡证明、法医鉴定意见、医院病历；③ 若合同未明确除外"猝死"，可主张按保险法不利解释原则（对条款有争议的作不利于保险人的解释）要求赔付；④ 协商不成向银保监会投诉（12378）或起诉。' },
  { id: 'sug-insurance-003', category: { type: 'sug', label: 'lawqa-insurance-003' }, content: '① 投保时务必看清等待期天数、等待期内条款约定；② 保存合同全文、代理人的说明记录；③ 若保险公司未尽明确说明义务（未提示等待期条款），可主张该条款不产生效力；④ 就医时间与等待期临界时，注意收集首次就诊时间证据。' },
  { id: 'sug-insurance-004', category: { type: 'sug', label: 'lawqa-insurance-004' }, content: '① 每次提交材料都保留快递单号和收件记录；② 书面（邮件或挂号信）催促保险公司限期结案，保留送达记录；③ 保险公司超期不核定的，可主张按已确定的金额先予支付；④ 向银保监会消费者权益保护局（12378）投诉；⑤ 起诉要求支付保险金及逾期利息。' },

  // ==================== 其他 ====================
  { id: 'sug-other-001', category: { type: 'sug', label: 'lawqa-other-001' }, content: '① 收集骚扰电话、短信记录，尝试获取信息来源线索；② 向信息处理者发函要求删除、说明信息使用情况；③ 向网信部门（12377）、工信部（12321）举报；④ 造成实际损失的，起诉要求赔偿；⑤ 涉及违法买卖个人信息的，及时向公安机关报案。' },
  { id: 'sug-other-002', category: { type: 'sug', label: 'lawqa-other-002' }, content: '① 第一时间拍摄现场、狗主人及犬只照片，索取联系方式；② 保存就医记录、缴费发票、疫苗注射记录；③ 报警处理并申请调解，由民警出具调解记录；④ 协商不成的，起诉主张医疗费、护理费、误工费、精神损害抚慰金；⑤ 向城管部门举报违规养犬行为。' },
  { id: 'sug-other-003', category: { type: 'sug', label: 'lawqa-other-003' }, content: '① 贵重物品务必保价，并按实际价值申报；② 保留寄件凭证、物品价值证明（发票、购买记录）；③ 快递丢失后先向快递公司投诉，获取遗失确认；④ 协商不成向国家邮政局（12305）申诉，邮政管理部门会督促企业赔付；⑤ 大额物品可通过法院诉讼主张按实际价值赔偿。' },
  { id: 'sug-other-004', category: { type: 'sug', label: 'lawqa-other-004' }, content: '① 立即通知物业公司制止，要求其向住房和城乡建设主管部门报告；② 拨打 12345 或向当地住建局（建设工程质量安全监督站）举报；③ 保存现场照片、视频证据；④ 情况紧急、楼体已出现裂缝的，立即报警并组织撤离；⑤ 可起诉要求恢复原状并赔偿损失，必要时申请证据保全。' },
];

// ==================== 兼容导出（旧扁平结构，由以上三组数据派生） ====================
// 保持旧代码 `import { LAW_QA } from '../data/QAData'` 可用，字段与原扁平数据一致
export const LAW_QA = LAW_QA_QUESTIONS.map((q) => {
  const comment = LAW_QA_ANSWERS
    .filter((a) => a.category && a.category.label === q.cid)
    .map((a) => a.content);
  const suggestion = LAW_QA_SUGGESTIONS.find(
    (s) => s.category && s.category.label === q.cid
  );
  return {
    id: q.id,
    chapter: q.chapter,
    question: q.question,
    comment,
    suggestion: suggestion ? suggestion.content : '',
  };
});
