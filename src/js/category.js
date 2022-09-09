/**
 * 药品分类
 * */
const typeArr = [
  {id: '1', name: '全部', show: true},
  {
    id: '5a90194d-48bb-11eb-af77-246e965b5b90',
    pid: '2b604502-48bb-11eb-af77-246e965b5b90',
    name: '感冒用药',
    show: true,
  },
  {
    id: '6d11072c-48bb-11eb-af77-246e965b5b90',
    pid: '2b604502-48bb-11eb-af77-246e965b5b90',
    name: '镇痛消炎',
    show: true,
  },
  {
    id: 'ba753295-48bb-11eb-af77-246e965b5b90',
    pid: '2b604502-48bb-11eb-af77-246e965b5b90',
    name: '呼吸系统',
    show: true,
  },
  {
    id: '2edb9041-48bc-11eb-af77-246e965b5b90',
    pid: '2b604502-48bb-11eb-af77-246e965b5b90',
    name: '避孕用药',
    show: true,
  },
  {
    id: 'c4313e74-48bb-11eb-af77-246e965b5b90',
    pid: '2b604502-48bb-11eb-af77-246e965b5b90',
    name: '胃肠道',
    show: true,
  },
  {
    id: 'e5b7a3f6-48bb-11eb-af77-246e965b5b90',
    pid: '2b604502-48bb-11eb-af77-246e965b5b90',
    name: '儿童用药',
    show: true,
  },
  {
    id: 'efc85071-48bb-11eb-af77-246e965b5b90',
    pid: '2b604502-48bb-11eb-af77-246e965b5b90',
    name: '五官用药',
    show: true,
  },
  {
    id: 'f79e5c9f-48bb-11eb-af77-246e965b5b90',
    pid: '2b604502-48bb-11eb-af77-246e965b5b90',
    name: '妇科用药',
    show: true,
  },
  {
    id: '0a7ec02d-48bc-11eb-af77-246e965b5b90',
    pid: '2b604502-48bb-11eb-af77-246e965b5b90',
    name: '清热解毒',
    show: true,
  },
  {
    id: '1e30478b-48bc-11eb-af77-246e965b5b90',
    pid: '2b604502-48bb-11eb-af77-246e965b5b90',
    name: '滋补养生',
    show: true,
  },
  {
    id: '2629e978-48bc-11eb-af77-246e965b5b90',
    pid: '2b604502-48bb-11eb-af77-246e965b5b90',
    name: '健脑助眠',
    show: true,
  },
  {
    id: '37e38d31-48bc-11eb-af77-246e965b5b90',
    pid: '2b604502-48bb-11eb-af77-246e965b5b90',
    name: '抗过敏药',
    show: true,
  },
  {
    id: 'cc14164a-48bb-11eb-af77-246e965b5b90',
    pid: '2b604502-48bb-11eb-af77-246e965b5b90',
    name: '肝胆用药',
    show: true,
  },
  {
    id: 'd3b46448-48bb-11eb-af77-246e965b5b90',
    pid: '2b604502-48bb-11eb-af77-246e965b5b90',
    name: '骨伤用药',
    show: true,
  },
  {
    id: 'dc8cd091-48bb-11eb-af77-246e965b5b90',
    pid: '2b604502-48bb-11eb-af77-246e965b5b90',
    name: '泌尿系统',
    show: true,
  },
  {
    id: '0098d606-48bc-11eb-af77-246e965b5b90',
    pid: '2b604502-48bb-11eb-af77-246e965b5b90',
    name: '外用药',
    show: true,
  },
  {
    id: '13fc4171-48bc-11eb-af77-246e965b5b90',
    pid: '2b604502-48bb-11eb-af77-246e965b5b90',
    name: '维生素',
    show: true,
  },
  {
    id: '4300fd89-48bc-11eb-af77-246e965b5b90',
    pid: '2b604502-48bb-11eb-af77-246e965b5b90',
    name: '其他',
  },
  {
    id: '0127a2b7-48cc-11eb-af77-246e965b5b90',
    pid: '13fc4171-48bc-11eb-af77-246e965b5b90',
    name: '复方维生素或矿物质',
  },
  {
    id: '02696023-48bb-11eb-af77-246e965b5b90',
    pid: 'bd11de9f-48b0-11eb-af77-246e965b5b90',
    name: '抗骨质增生药',
  },
  {
    id: '05fba6ff-48ba-11eb-af77-246e965b5b90',
    pid: '1255a1ab-48b0-11eb-af77-246e965b5b90',
    name: '儿童补益药',
  },
  {
    id: '0769a91f-48cb-11eb-af77-246e965b5b90',
    pid: 'efc85071-48bb-11eb-af77-246e965b5b90',
    name: '其他',
  },
  {
    id: '078ba8e7-48b2-11eb-af77-246e965b5b90',
    pid: 'c37d0da0-48af-11eb-af77-246e965b5b90',
    name: '调节血脂及活血化瘀',
  },
  {
    id: '096770d5-48b0-11eb-af77-246e965b5b90',
    pid: '50f78d37-48af-11eb-af77-246e965b5b90',
    name: '外用药',
  },
  {
    id: '0afdbc63-48bb-11eb-af77-246e965b5b90',
    pid: 'bd11de9f-48b0-11eb-af77-246e965b5b90',
    name: '通经活络、活血止痛',
  },
  {
    id: '0b0b5579-48b3-11eb-af77-246e965b5b90',
    pid: 'de79fea6-48af-11eb-af77-246e965b5b90',
    name: '补肺肾、益精气',
  },
  {
    id: '0b6fb81f-48cc-11eb-af77-246e965b5b90',
    pid: '13fc4171-48bc-11eb-af77-246e965b5b90',
    name: '增加毛细血管出血证',
  },
  {
    id: '0c2be9fb-48c2-11eb-af77-246e965b5b90',
    pid: 'd3b46448-48bb-11eb-af77-246e965b5b90',
    name: '抗风湿药',
  },
  {
    id: '0d1bb038-48ba-11eb-af77-246e965b5b90',
    pid: '1255a1ab-48b0-11eb-af77-246e965b5b90',
    name: '其他',
  },
  {
    id: '0f1efb5d-48cd-11eb-af77-246e965b5b90',
    pid: '37e38d31-48bc-11eb-af77-246e965b5b90',
    name: '抗过敏药',
  },
  {
    id: '10e3d2d8-48b2-11eb-af77-246e965b5b90',
    pid: 'c37d0da0-48af-11eb-af77-246e965b5b90',
    name: '周围血管舒张药及脑激活剂',
  },
  {
    id: '1255a1ab-48b0-11eb-af77-246e965b5b90',
    pid: '50f78d37-48af-11eb-af77-246e965b5b90',
    name: '儿童用药',
  },
  {
    id: '13247e2e-48cc-11eb-af77-246e965b5b90',
    pid: '13fc4171-48bc-11eb-af77-246e965b5b90',
    name: '其他',
  },
  {
    id: '1470a5e7-48bd-11eb-af77-246e965b5b90',
    pid: '5a90194d-48bb-11eb-af77-246e965b5b90',
    name: '抗病毒感冒药',
  },
  {
    id: '14ec90e4-48bb-11eb-af77-246e965b5b90',
    pid: 'bd11de9f-48b0-11eb-af77-246e965b5b90',
    name: '其他',
  },
  {
    id: '153fa63e-48b3-11eb-af77-246e965b5b90',
    pid: 'de79fea6-48af-11eb-af77-246e965b5b90',
    name: '其他',
  },
  {
    id: '1778f08d-48cd-11eb-af77-246e965b5b90',
    pid: '37e38d31-48bc-11eb-af77-246e965b5b90',
    name: '抗眩晕药',
  },
  {
    id: '191e825f-48b2-11eb-af77-246e965b5b90',
    pid: 'c37d0da0-48af-11eb-af77-246e965b5b90',
    name: '抗血压药',
  },
  {
    id: '196f295c-48ba-11eb-af77-246e965b5b90',
    pid: '1dd95e8a-48b0-11eb-af77-246e965b5b90',
    name: '清热消炎药',
  },
  {
    id: '1dd95e8a-48b0-11eb-af77-246e965b5b90',
    pid: '50f78d37-48af-11eb-af77-246e965b5b90',
    name: '妇科用药',
  },
  {
    id: '1f258253-48c1-11eb-af77-246e965b5b90',
    pid: 'cc14164a-48bb-11eb-af77-246e965b5b90',
    name: '肝病用药',
  },
  {
    id: '21634843-48cb-11eb-af77-246e965b5b90',
    pid: 'f79e5c9f-48bb-11eb-af77-246e965b5b90',
    name: '清热消炎药',
  },
  {
    id: '21fd5ef7-48cc-11eb-af77-246e965b5b90',
    pid: '1e30478b-48bc-11eb-af77-246e965b5b90',
    name: '补益养生药',
  },
  {
    id: '2238300d-48b2-11eb-af77-246e965b5b90',
    pid: 'c37d0da0-48af-11eb-af77-246e965b5b90',
    name: '抗心律失常药物',
  },
  {
    id: '22f73bcc-48c2-11eb-af77-246e965b5b90',
    pid: 'dc8cd091-48bb-11eb-af77-246e965b5b90',
    name: '抗骨质增生药',
  },
  {
    id: '282b1cdf-48b3-11eb-af77-246e965b5b90',
    pid: 'e77476cf-48af-11eb-af77-246e965b5b90',
    name: '中枢神经兴奋及抗重症肌无力药',
  },
  {
    id: '2a02e6c8-48c1-11eb-af77-246e965b5b90',
    pid: 'cc14164a-48bb-11eb-af77-246e965b5b90',
    name: '利胆用药',
  },
  {
    id: '2a23e31a-48b2-11eb-af77-246e965b5b90',
    pid: 'c37d0da0-48af-11eb-af77-246e965b5b90',
    name: '疏略通脉抗动脉硬化药物',
  },
  {
    id: '2b7e78a4-48cc-11eb-af77-246e965b5b90',
    pid: '1e30478b-48bc-11eb-af77-246e965b5b90',
    name: '补血养颜美容药',
  },
  {
    id: '31f3833a-48ca-11eb-af77-246e965b5b90',
    pid: 'dc8cd091-48bb-11eb-af77-246e965b5b90',
    name: '尿结石类',
  },
  {
    id: '32f362d9-48cc-11eb-af77-246e965b5b90',
    pid: '1e30478b-48bc-11eb-af77-246e965b5b90',
    name: '滋阴补肾',
  },
  {
    id: '3314fbae-48c2-11eb-af77-246e965b5b90',
    pid: 'dc8cd091-48bb-11eb-af77-246e965b5b90',
    name: '活血化瘀、跌打损伤药',
  },
  {
    id: '34b492de-48c1-11eb-af77-246e965b5b90',
    pid: 'cc14164a-48bb-11eb-af77-246e965b5b90',
    name: '其他',
  },
  {
    id: '36fdfe8a-48b1-11eb-af77-246e965b5b90',
    pid: '50f78d37-48af-11eb-af77-246e965b5b90',
    name: '其他',
  },
  {
    id: '3a8d9ddf-48b3-11eb-af77-246e965b5b90',
    pid: 'e77476cf-48af-11eb-af77-246e965b5b90',
    name: '非橈体抗炎镇痛、抗痛风药',
  },
  {
    id: '3b51bb53-48cc-11eb-af77-246e965b5b90',
    pid: '1e30478b-48bc-11eb-af77-246e965b5b90',
    name: '补虚证类',
  },
  {
    id: '3f5e8a3b-48c0-11eb-af77-246e965b5b90',
    pid: 'c4313e74-48bb-11eb-af77-246e965b5b90',
    name: '制酸剂及抗溃疡药',
  },
  {
    id: '3ff7feb8-48ca-11eb-af77-246e965b5b90',
    pid: 'dc8cd091-48bb-11eb-af77-246e965b5b90',
    name: '尿路感染',
  },
  {
    id: '427295a3-48b3-11eb-af77-246e965b5b90',
    pid: 'e77476cf-48af-11eb-af77-246e965b5b90',
    name: '作用于植物精神系、脑代谢调节药',
  },
  {
    id: '439b1ee3-48b2-11eb-af77-246e965b5b90',
    pid: 'c37d0da0-48af-11eb-af77-246e965b5b90',
    name: '其他心脑血管系统用药',
  },
  {
    id: '43a7c625-48cc-11eb-af77-246e965b5b90',
    pid: '1e30478b-48bc-11eb-af77-246e965b5b90',
    name: '其他',
  },
  {
    id: '477d8ace-48cb-11eb-af77-246e965b5b90',
    pid: 'f79e5c9f-48bb-11eb-af77-246e965b5b90',
    name: '调经补益药',
  },
  {
    id: '4ad820ed-48ca-11eb-af77-246e965b5b90',
    pid: 'e5b7a3f6-48bb-11eb-af77-246e965b5b90',
    name: '儿童感冒及解热镇痛药',
  },
  {
    id: '4cc5359c-48b3-11eb-af77-246e965b5b90',
    pid: 'e77476cf-48af-11eb-af77-246e965b5b90',
    name: '抗震颤麻痹、痉挛药',
  },
  {
    id: '513c8f92-48b2-11eb-af77-246e965b5b90',
    pid: 'cd6c2ec9-48af-11eb-af77-246e965b5b90',
    name: '制酸剂及抗溃疡药物',
  },
  {
    id: '51e39554-48cb-11eb-af77-246e965b5b90',
    pid: 'f79e5c9f-48bb-11eb-af77-246e965b5b90',
    name: '孕、妇产品用药',
  },
  {
    id: '5931cf7e-48b3-11eb-af77-246e965b5b90',
    pid: 'e77476cf-48af-11eb-af77-246e965b5b90',
    name: '抗精神失常药',
  },
  {
    id: '59ec89c2-48ca-11eb-af77-246e965b5b90',
    pid: 'e5b7a3f6-48bb-11eb-af77-246e965b5b90',
    name: '呼吸系统用药',
  },
  {
    id: '5ab9eb47-48cb-11eb-af77-246e965b5b90',
    pid: 'f79e5c9f-48bb-11eb-af77-246e965b5b90',
    name: '妇科外用药',
  },
  {
    id: '5f6b81c0-48b9-11eb-af77-246e965b5b90',
    pid: 'f46b921f-48af-11eb-af77-246e965b5b90',
    name: '类风湿类',
  },
  {
    id: '5f760d71-48c0-11eb-af77-246e965b5b90',
    pid: 'c4313e74-48bb-11eb-af77-246e965b5b90',
    name: '胃肠调节药、抗气胀药及抗炎药解痉药',
  },
  {
    id: '6108d84b-48b3-11eb-af77-246e965b5b90',
    pid: 'e77476cf-48af-11eb-af77-246e965b5b90',
    name: '抗颠痛药及抗惊厥药',
  },
  {
    id: '64a17fd2-48cb-11eb-af77-246e965b5b90',
    pid: 'f79e5c9f-48bb-11eb-af77-246e965b5b90',
    name: '其他',
  },
  {
    id: '64afb3b5-48cc-11eb-af77-246e965b5b90',
    pid: '2629e978-48bc-11eb-af77-246e965b5b90',
    name: '滋阴补血、宁心安神',
  },
  {
    id: '652692d8-48b2-11eb-af77-246e965b5b90',
    pid: 'cd6c2ec9-48af-11eb-af77-246e965b5b90',
    name: '肠胃调节药、抗气胀药、抗炎药',
  },
  {
    id: '679057d8-48b9-11eb-af77-246e965b5b90',
    pid: 'f46b921f-48af-11eb-af77-246e965b5b90',
    name: '其他',
  },
  {
    id: '693dbf82-48b3-11eb-af77-246e965b5b90',
    pid: 'e77476cf-48af-11eb-af77-246e965b5b90',
    name: '镇静催眠药',
  },
  {
    id: '6947a25f-48ca-11eb-af77-246e965b5b90',
    pid: 'e5b7a3f6-48bb-11eb-af77-246e965b5b90',
    name: '消化系统用药',
  },
  {
    id: '6c49139f-48bd-11eb-af77-246e965b5b90',
    pid: '5a90194d-48bb-11eb-af77-246e965b5b90',
    name: '解热镇痛消炎药',
  },
  {
    id: '70f223f1-48b3-11eb-af77-246e965b5b90',
    pid: 'e77476cf-48af-11eb-af77-246e965b5b90',
    name: '抗组织胺药',
  },
  {
    id: '71407ede-48c0-11eb-af77-246e965b5b90',
    pid: 'c4313e74-48bb-11eb-af77-246e965b5b90',
    name: '驱虫药',
  },
  {
    id: '7286157c-48ba-11eb-af77-246e965b5b90',
    pid: '1dd95e8a-48b0-11eb-af77-246e965b5b90',
    name: '调经补益药',
  },
  {
    id: '74bb13f9-48cb-11eb-af77-246e965b5b90',
    pid: '0098d606-48bc-11eb-af77-246e965b5b90',
    name: '外用抗感染药',
  },
  {
    id: '7562bbc6-48b2-11eb-af77-246e965b5b90',
    pid: 'cd6c2ec9-48af-11eb-af77-246e965b5b90',
    name: '解痉药',
  },
  {
    id: '75d27c50-48b9-11eb-af77-246e965b5b90',
    pid: 'ff09ed93-48af-11eb-af77-246e965b5b90',
    name: '烷化剂',
  },
  {
    id: '76d5ebba-48af-11eb-af77-246e965b5b90',
    pid: '50f78d37-48af-11eb-af77-246e965b5b90',
    name: '抗感染药',
  },
  {
    id: '790c9310-48b3-11eb-af77-246e965b5b90',
    pid: 'e77476cf-48af-11eb-af77-246e965b5b90',
    name: '其他精神系统用药',
  },
  {
    id: '7a0d6425-48ba-11eb-af77-246e965b5b90',
    pid: '1dd95e8a-48b0-11eb-af77-246e965b5b90',
    name: '孕、妇产用药',
  },
  {
    id: '7b5c458a-48ca-11eb-af77-246e965b5b90',
    pid: 'e5b7a3f6-48bb-11eb-af77-246e965b5b90',
    name: '儿童补益药',
  },
  {
    id: '7dc9bdb8-48bd-11eb-af77-246e965b5b90',
    pid: 'ba753295-48bb-11eb-af77-246e965b5b90',
    name: '清热祛痰止咳平喘药',
  },
  {
    id: '7e037292-48b9-11eb-af77-246e965b5b90',
    pid: 'ff09ed93-48af-11eb-af77-246e965b5b90',
    name: '抗代谢药',
  },
  {
    id: '7e2b31d1-48cb-11eb-af77-246e965b5b90',
    pid: '0098d606-48bc-11eb-af77-246e965b5b90',
    name: '防腐及消毒剂',
  },
  {
    id: '7f887aa3-48b2-11eb-af77-246e965b5b90',
    pid: 'cd6c2ec9-48af-11eb-af77-246e965b5b90',
    name: '止泻药及泻药',
  },
  {
    id: '814b4236-48ba-11eb-af77-246e965b5b90',
    pid: '1dd95e8a-48b0-11eb-af77-246e965b5b90',
    name: '妇科外用药',
  },
  {
    id: '837c2335-48c0-11eb-af77-246e965b5b90',
    pid: 'c4313e74-48bb-11eb-af77-246e965b5b90',
    name: '吸附药',
  },
  {
    id: '84cfc922-48cb-11eb-af77-246e965b5b90',
    pid: '0098d606-48bc-11eb-af77-246e965b5b90',
    name: '药制外科敷料',
  },
  {
    id: '84fcaaba-48b3-11eb-af77-246e965b5b90',
    pid: 'f46b921f-48af-11eb-af77-246e965b5b90',
    name: '肾上腺皮质激素用药',
  },
  {
    id: '855131ce-48ca-11eb-af77-246e965b5b90',
    pid: 'e5b7a3f6-48bb-11eb-af77-246e965b5b90',
    name: '其他',
  },
  {
    id: '86aa34bd-48b9-11eb-af77-246e965b5b90',
    pid: 'ff09ed93-48af-11eb-af77-246e965b5b90',
    name: '抗生素类',
  },
  {
    id: '8820a9a6-48b2-11eb-af77-246e965b5b90',
    pid: 'cd6c2ec9-48af-11eb-af77-246e965b5b90',
    name: '粘膜保护药',
  },
  {
    id: '8a5be54f-48bc-11eb-af77-246e965b5b90',
    pid: '5a90194d-48bb-11eb-af77-246e965b5b90',
    name: '风湿感冒药',
  },
  {
    id: '8c3090ba-48cb-11eb-af77-246e965b5b90',
    pid: '0098d606-48bc-11eb-af77-246e965b5b90',
    name: '外用疔肿',
  },
  {
    id: '8ce2659b-48b3-11eb-af77-246e965b5b90',
    pid: 'f46b921f-48af-11eb-af77-246e965b5b90',
    name: '性激素类药及避孕药',
  },
  {
    id: '8dde109b-48b9-11eb-af77-246e965b5b90',
    pid: 'ff09ed93-48af-11eb-af77-246e965b5b90',
    name: '天然来源类',
  },
  {
    id: '8f70ad3c-48ba-11eb-af77-246e965b5b90',
    pid: '9d9ba637-48b0-11eb-af77-246e965b5b90',
    name: '眼科用药',
  },
  {
    id: '925c1e30-48b2-11eb-af77-246e965b5b90',
    pid: 'cd6c2ec9-48af-11eb-af77-246e965b5b90',
    name: '抗胆碱药',
  },
  {
    id: '92b34242-48cb-11eb-af77-246e965b5b90',
    pid: '0098d606-48bc-11eb-af77-246e965b5b90',
    name: '外用抗真菌',
  },
  {
    id: '94ea658c-48c0-11eb-af77-246e965b5b90',
    pid: 'c4313e74-48bb-11eb-af77-246e965b5b90',
    name: '清肝泻火、润肠通便',
  },
  {
    id: '955f7797-48b9-11eb-af77-246e965b5b90',
    pid: 'ff09ed93-48af-11eb-af77-246e965b5b90',
    name: '激素类抗肿瘤药',
  },
  {
    id: '95796482-48cc-11eb-af77-246e965b5b90',
    pid: '2629e978-48bc-11eb-af77-246e965b5b90',
    name: '其他',
  },
  {
    id: '972d0fe1-48ba-11eb-af77-246e965b5b90',
    pid: '9d9ba637-48b0-11eb-af77-246e965b5b90',
    name: '耳科用药',
  },
  {
    id: '9816a57f-48bd-11eb-af77-246e965b5b90',
    pid: 'ba753295-48bb-11eb-af77-246e965b5b90',
    name: '干咳药',
  },
  {
    id: '997ef9a7-48cb-11eb-af77-246e965b5b90',
    pid: '0098d606-48bc-11eb-af77-246e965b5b90',
    name: '各种手、足癣',
  },
  {
    id: '9b95f189-48b1-11eb-af77-246e965b5b90',
    pid: '76d5ebba-48af-11eb-af77-246e965b5b90',
    name: '内酰胺（青霉素、头孢类）',
  },
  {
    id: '9c0af9c5-48b3-11eb-af77-246e965b5b90',
    pid: 'f46b921f-48af-11eb-af77-246e965b5b90',
    name: '胰岛素及影响血糖药',
  },
  {
    id: '9cc00ac5-48b2-11eb-af77-246e965b5b90',
    pid: 'cd6c2ec9-48af-11eb-af77-246e965b5b90',
    name: '理气健胃、除湿化滞',
  },
  {
    id: '9cfae92a-48b9-11eb-af77-246e965b5b90',
    pid: 'ff09ed93-48af-11eb-af77-246e965b5b90',
    name: '其他',
  },
  {
    id: '9d9ba637-48b0-11eb-af77-246e965b5b90',
    pid: '50f78d37-48af-11eb-af77-246e965b5b90',
    name: '五官用药',
  },
  {
    id: '9e4eb3a6-48c0-11eb-af77-246e965b5b90',
    pid: 'c4313e74-48bb-11eb-af77-246e965b5b90',
    name: '止泻药及泻药',
  },
  {
    id: 'a0476ba5-48ba-11eb-af77-246e965b5b90',
    pid: '9d9ba637-48b0-11eb-af77-246e965b5b90',
    name: '鼻科用药',
  },
  {
    id: 'a08f8b04-48cb-11eb-af77-246e965b5b90',
    pid: '0098d606-48bc-11eb-af77-246e965b5b90',
    name: '止痛祛风止痒',
  },
  {
    id: 'a157a35f-48cc-11eb-af77-246e965b5b90',
    pid: '2edb9041-48bc-11eb-af77-246e965b5b90',
    name: '口服避孕药',
  },
  {
    id: 'a69d3e6e-48b3-11eb-af77-246e965b5b90',
    pid: 'f46b921f-48af-11eb-af77-246e965b5b90',
    name: '甲状腺激素类药及抗甲状腺药',
  },
  {
    id: 'a7b98038-48bf-11eb-af77-246e965b5b90',
    pid: 'ba753295-48bb-11eb-af77-246e965b5b90',
    name: '养阴润肺、 化痰止咳',
  },
  {
    id: 'a821a42e-48b2-11eb-af77-246e965b5b90',
    pid: 'cd6c2ec9-48af-11eb-af77-246e965b5b90',
    name: '其他',
  },
  {
    id: 'a8b14983-48b9-11eb-af77-246e965b5b90',
    pid: '096770d5-48b0-11eb-af77-246e965b5b90',
    name: '外用含激素类药物',
  },
  {
    id: 'aa186c56-48b0-11eb-af77-246e965b5b90',
    pid: '50f78d37-48af-11eb-af77-246e965b5b90',
    name: '滋补养颜',
  },
  {
    id: 'acd08006-48bd-11eb-af77-246e965b5b90',
    pid: 'ba753295-48bb-11eb-af77-246e965b5b90',
    name: '气管炎用药',
  },
  {
    id: 'ad92dc98-48b1-11eb-af77-246e965b5b90',
    pid: '76d5ebba-48af-11eb-af77-246e965b5b90',
    name: '大内环酯类',
  },
  {
    id: 'af2f286e-48cb-11eb-af77-246e965b5b90',
    pid: '0098d606-48bc-11eb-af77-246e965b5b90',
    name: '外用痔疮类',
  },
  {
    id: 'b3254b3d-48c0-11eb-af77-246e965b5b90',
    pid: 'c4313e74-48bb-11eb-af77-246e965b5b90',
    name: '其他',
  },
  {
    id: 'b3f09b80-48b0-11eb-af77-246e965b5b90',
    pid: '50f78d37-48af-11eb-af77-246e965b5b90',
    name: '生物制品',
  },
  {
    id: 'b4b81fd8-48b2-11eb-af77-246e965b5b90',
    pid: 'cd6c2ec9-48af-11eb-af77-246e965b5b90',
    name: '肝病用药',
  },
  {
    id: 'b620210a-48ba-11eb-af77-246e965b5b90',
    pid: '9d9ba637-48b0-11eb-af77-246e965b5b90',
    name: '口腔用药',
  },
  {
    id: 'b65378d8-48b1-11eb-af77-246e965b5b90',
    pid: '76d5ebba-48af-11eb-af77-246e965b5b90',
    name: '抗真菌类',
  },
  {
    id: 'b6b1c93f-48cb-11eb-af77-246e965b5b90',
    pid: '0098d606-48bc-11eb-af77-246e965b5b90',
    name: '外用皮肤用药',
  },
  {
    id: 'b712f6be-48cc-11eb-af77-246e965b5b90',
    pid: '2edb9041-48bc-11eb-af77-246e965b5b90',
    name: '外用避孕药',
  },
  {
    id: 'b8ee47b3-48b9-11eb-af77-246e965b5b90',
    pid: '096770d5-48b0-11eb-af77-246e965b5b90',
    name: '外用抗感染药',
  },
  {
    id: 'bc70c2a4-48bf-11eb-af77-246e965b5b90',
    pid: 'ba753295-48bb-11eb-af77-246e965b5b90',
    name: '其他',
  },
  {
    id: 'bd11de9f-48b0-11eb-af77-246e965b5b90',
    pid: '50f78d37-48af-11eb-af77-246e965b5b90',
    name: '骨伤用药',
  },
  {
    id: 'bdd9af5f-48ba-11eb-af77-246e965b5b90',
    pid: '9d9ba637-48b0-11eb-af77-246e965b5b90',
    name: '咽喉用药',
  },
  {
    id: 'be1d5bb1-48b2-11eb-af77-246e965b5b90',
    pid: 'cd6c2ec9-48af-11eb-af77-246e965b5b90',
    name: '利胆药、胆石溶解及排石药',
  },
  {
    id: 'be5b4d5c-48cb-11eb-af77-246e965b5b90',
    pid: '0098d606-48bc-11eb-af77-246e965b5b90',
    name: '外用贴剂',
  },
  {
    id: 'bf51d999-48b1-11eb-af77-246e965b5b90',
    pid: '76d5ebba-48af-11eb-af77-246e965b5b90',
    name: '抗病毒类',
  },
  {
    id: 'c0fe4b8c-48b9-11eb-af77-246e965b5b90',
    pid: '096770d5-48b0-11eb-af77-246e965b5b90',
    name: '防腐及消毒剂',
  },
  {
    id: 'c37d0da0-48af-11eb-af77-246e965b5b90',
    pid: '50f78d37-48af-11eb-af77-246e965b5b90',
    name: '循环系统用药',
  },
  {
    id: 'c592e427-48cb-11eb-af77-246e965b5b90',
    pid: '0098d606-48bc-11eb-af77-246e965b5b90',
    name: '止痛消炎、活血化瘀药',
  },
  {
    id: 'c5954c6f-48ba-11eb-af77-246e965b5b90',
    pid: '9d9ba637-48b0-11eb-af77-246e965b5b90',
    name: '其他',
  },
  {
    id: 'c670e2fb-48b0-11eb-af77-246e965b5b90',
    pid: '50f78d37-48af-11eb-af77-246e965b5b90',
    name: '抗过敏药',
  },
  {
    id: 'c7a4892c-48b1-11eb-af77-246e965b5b90',
    pid: '76d5ebba-48af-11eb-af77-246e965b5b90',
    name: '抗感染中药类',
  },
  {
    id: 'c85bd3fe-48b2-11eb-af77-246e965b5b90',
    pid: 'cd6c2ec9-48af-11eb-af77-246e965b5b90',
    name: '肾病用药',
  },
  {
    id: 'c8ca2dd4-48bc-11eb-af77-246e965b5b90',
    pid: '5a90194d-48bb-11eb-af77-246e965b5b90',
    name: '风热感冒药',
  },
  {
    id: 'ca2873fe-48b9-11eb-af77-246e965b5b90',
    pid: '096770d5-48b0-11eb-af77-246e965b5b90',
    name: '药制外科敷料',
  },
  {
    id: 'cd0ee671-48cb-11eb-af77-246e965b5b90',
    pid: '0098d606-48bc-11eb-af77-246e965b5b90',
    name: '皮肤溃疡及烧烫伤药',
  },
  {
    id: 'cd6c2ec9-48af-11eb-af77-246e965b5b90',
    pid: '50f78d37-48af-11eb-af77-246e965b5b90',
    name: '消化系统用药',
  },
  {
    id: 'cdeca4e7-48ba-11eb-af77-246e965b5b90',
    pid: 'aa186c56-48b0-11eb-af77-246e965b5b90',
    name: '补益养生药',
  },
  {
    id: 'cee11bb4-48ca-11eb-af77-246e965b5b90',
    pid: 'efc85071-48bb-11eb-af77-246e965b5b90',
    name: '眼科用药',
  },
  {
    id: 'd1c8a9b3-48b2-11eb-af77-246e965b5b90',
    pid: 'cd6c2ec9-48af-11eb-af77-246e965b5b90',
    name: '其他',
  },
  {
    id: 'd2015aed-48b9-11eb-af77-246e965b5b90',
    pid: '096770d5-48b0-11eb-af77-246e965b5b90',
    name: '护肤药',
  },
  {
    id: 'd406bd0c-48cb-11eb-af77-246e965b5b90',
    pid: '0098d606-48bc-11eb-af77-246e965b5b90',
    name: '其他',
  },
  {
    id: 'd4d4f7ff-48b0-11eb-af77-246e965b5b90',
    pid: '50f78d37-48af-11eb-af77-246e965b5b90',
    name: '抗眩晕药',
  },
  {
    id: 'd61a6013-48af-11eb-af77-246e965b5b90',
    pid: '50f78d37-48af-11eb-af77-246e965b5b90',
    name: '肝胆肾用药',
  },
  {
    id: 'd70f64b5-48b1-11eb-af77-246e965b5b90',
    pid: '76d5ebba-48af-11eb-af77-246e965b5b90',
    name: '磺胺类',
  },
  {
    id: 'd908c7d8-48ca-11eb-af77-246e965b5b90',
    pid: 'efc85071-48bb-11eb-af77-246e965b5b90',
    name: '耳科用药',
  },
  {
    id: 'd9188c6c-48b9-11eb-af77-246e965b5b90',
    pid: '096770d5-48b0-11eb-af77-246e965b5b90',
    name: '止痛消炎、活血化瘀药',
  },
  {
    id: 'd9a1789b-48ba-11eb-af77-246e965b5b90',
    pid: 'aa186c56-48b0-11eb-af77-246e965b5b90',
    name: '养颜美容药',
  },
  {
    id: 'd9d48cf5-48bc-11eb-af77-246e965b5b90',
    pid: '5a90194d-48bb-11eb-af77-246e965b5b90',
    name: '暑湿感冒药',
  },
  {
    id: 'de79fea6-48af-11eb-af77-246e965b5b90',
    pid: '50f78d37-48af-11eb-af77-246e965b5b90',
    name: '呼吸系统用药',
  },
  {
    id: 'deb02b2b-48cb-11eb-af77-246e965b5b90',
    pid: '0a7ec02d-48bc-11eb-af77-246e965b5b90',
    name: '清热解毒',
  },
  {
    id: 'dfbb9d46-48b9-11eb-af77-246e965b5b90',
    pid: '096770d5-48b0-11eb-af77-246e965b5b90',
    name: '皮肤溃疡及烧烫伤药',
  },
  {
    id: 'e0801d0a-48ba-11eb-af77-246e965b5b90',
    pid: 'aa186c56-48b0-11eb-af77-246e965b5b90',
    name: '其他',
  },
  {
    id: 'e09ae01c-48b1-11eb-af77-246e965b5b90',
    pid: '76d5ebba-48af-11eb-af77-246e965b5b90',
    name: '其他抗生素类',
  },
  {
    id: 'e17868c9-48b2-11eb-af77-246e965b5b90',
    pid: 'de79fea6-48af-11eb-af77-246e965b5b90',
    name: '镇咳药',
  },
  {
    id: 'e4f73932-48ca-11eb-af77-246e965b5b90',
    pid: 'efc85071-48bb-11eb-af77-246e965b5b90',
    name: '鼻科用药',
  },
  {
    id: 'e6b0842b-48b9-11eb-af77-246e965b5b90',
    pid: '096770d5-48b0-11eb-af77-246e965b5b90',
    name: '其他',
  },
  {
    id: 'e77476cf-48af-11eb-af77-246e965b5b90',
    pid: '50f78d37-48af-11eb-af77-246e965b5b90',
    name: '精神系统用药',
  },
  {
    id: 'eaaa48de-48ba-11eb-af77-246e965b5b90',
    pid: 'b3f09b80-48b0-11eb-af77-246e965b5b90',
    name: '生物制品',
  },
  {
    id: 'eba7a342-48b1-11eb-af77-246e965b5b90',
    pid: 'c37d0da0-48af-11eb-af77-246e965b5b90',
    name: '钙通道拮抗剂',
  },
  {
    id: 'ece66615-48cb-11eb-af77-246e965b5b90',
    pid: '13fc4171-48bc-11eb-af77-246e965b5b90',
    name: '调节水、盐、电解质及酸敏平衡',
  },
  {
    id: 'ee80fdbe-48c9-11eb-af77-246e965b5b90',
    pid: 'dc8cd091-48bb-11eb-af77-246e965b5b90',
    name: '其他',
  },
  {
    id: 'effa3b5e-48b9-11eb-af77-246e965b5b90',
    pid: '1255a1ab-48b0-11eb-af77-246e965b5b90',
    name: '儿童抗感染用药',
  },
  {
    id: 'f00aeec6-48ca-11eb-af77-246e965b5b90',
    pid: 'efc85071-48bb-11eb-af77-246e965b5b90',
    name: '口腔用药',
  },
  {
    id: 'f46b921f-48af-11eb-af77-246e965b5b90',
    pid: '50f78d37-48af-11eb-af77-246e965b5b90',
    name: '内分泌系统用药',
  },
  {
    id: 'f49cf74d-48b2-11eb-af77-246e965b5b90',
    pid: 'de79fea6-48af-11eb-af77-246e965b5b90',
    name: '平喘药',
  },
  {
    id: 'f52c13b4-48b1-11eb-af77-246e965b5b90',
    pid: 'c37d0da0-48af-11eb-af77-246e965b5b90',
    name: '受体阻滞剂',
  },
  {
    id: 'f6bb9d84-48bc-11eb-af77-246e965b5b90',
    pid: '5a90194d-48bb-11eb-af77-246e965b5b90',
    name: '混合型感冒药',
  },
  {
    id: 'f73b2df6-48ba-11eb-af77-246e965b5b90',
    pid: 'bd11de9f-48b0-11eb-af77-246e965b5b90',
    name: '抗风湿药',
  },
  {
    id: 'f76fa495-48b9-11eb-af77-246e965b5b90',
    pid: '1255a1ab-48b0-11eb-af77-246e965b5b90',
    name: '呼吸系统用药',
  },
  {
    id: 'f80ea974-48cb-11eb-af77-246e965b5b90',
    pid: '13fc4171-48bc-11eb-af77-246e965b5b90',
    name: '单方维生素或矿物质',
  },
  {
    id: 'f9633809-48ca-11eb-af77-246e965b5b90',
    pid: 'efc85071-48bb-11eb-af77-246e965b5b90',
    name: '咽喉用药',
  },
  {
    id: 'febfaf58-48b9-11eb-af77-246e965b5b90',
    pid: '1255a1ab-48b0-11eb-af77-246e965b5b90',
    name: '消化系统用药',
  },
  {
    id: 'feeee6f9-48b1-11eb-af77-246e965b5b90',
    pid: 'c37d0da0-48af-11eb-af77-246e965b5b90',
    name: '防止心绞痛药物',
  },
  {
    id: 'ff09ed93-48af-11eb-af77-246e965b5b90',
    pid: '50f78d37-48af-11eb-af77-246e965b5b90',
    name: '抗肿瘤药',
  },
  {
    id: 'ff6c2a08-48b2-11eb-af77-246e965b5b90',
    pid: 'de79fea6-48af-11eb-af77-246e965b5b90',
    name: '祛痰药',
  },
];

class productCategory {
  constructor() {
    this.allCategory = typeArr;
    this.showCategory = this.allCategory.filter((item) => !!item.show);
  }
  init() {
    for (let i = 0; i < this.showCategory.length; i++) {
      let category = this.showCategory[i];
      let children = [];
      this.calcChildren(category, children);
      category.children = children;
    }
  }
  calcChildren(category, children) {
    this.allCategory.map((item) => {
      if (item.pid === category.id) {
        children.push(item.id);
        this.calcChildren(item, children);
      }
    });
  }
}

export default productCategory;
