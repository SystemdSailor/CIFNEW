/**
 * ============================================================
 * 社保养老金计算参数
 * ============================================================
 *
 * 文件职责：
 * 1. 保存国家统一参数
 * 2. 保存各地区、各年度待遇计发基数
 * 3. 提供参数查询函数
 *
 * 计算公式：
 *
 * 一、本人指数化月平均缴费工资
 *
 * 本人指数化月平均缴费工资
 * = 待遇计发基数 × 本人平均缴费工资指数
 *
 *
 * 二、基础养老金
 *
 * 基础养老金 =
 * (
 *   待遇计发基数
 *   +
 *   本人指数化月平均缴费工资
 * )
 * / 2
 * × 缴费年限
 * × 1%
 *
 *
 * 三、个人账户养老金
 *
 * 个人账户养老金 =
 * 退休时个人账户储存额
 * / 计发月数
 *
 *
 * 注意：
 * 本文件中的政策参数应以当地人力资源和社会保障部门
 * 公布的最新数据为准。
 */


/**
 * ============================================================
 * 国家统一参数
 * ============================================================
 */

export const NATIONAL_PARAMS = {

  /**
   * 基础养老金计算比例
   *
   * 公式中的 1%
   */
  basicPensionRate: 0.01,


  /**
   * ==========================================================
   * 个人账户养老金计发月数
   * ==========================================================
   *
   * key   = 退休年龄
   * value = 计发月数
   *
   * 单位：
   * 月
   */

  paymentMonths: {

    40: 233,
    41: 230,
    42: 226,
    43: 223,
    44: 220,
    45: 216,
    46: 212,
    47: 208,
    48: 204,
    49: 199,

    50: 195,
    51: 190,
    52: 185,
    53: 180,
    54: 175,
    55: 170,
    56: 164,
    57: 158,
    58: 152,
    59: 145,

    60: 139,
    61: 132,
    62: 125,
    63: 117,
    64: 109,
    65: 101,
    66: 93,
    67: 84,
    68: 75,
    69: 65,

    70: 56,
  },


  /**
   * 允许选择的退休年龄
   */
  retirementAges: [
    40,
    41,
    42,
    43,
    44,
    45,
    46,
    47,
    48,
    49,
    50,
    51,
    52,
    53,
    54,
    55,
    56,
    57,
    58,
    59,
    60,
    61,
    62,
    63,
    64,
    65,
    66,
    67,
    68,
    69,
    70,
  ],
};


/**
 * ============================================================
 * 各地区待遇计发基数
 * ============================================================
 *
 * 数据结构：
 *
 * regions
 *   ├── 北京
 *   │    ├── 2026
 *   │    ├── 2025
 *   │    └── 2024
 *   │
 *   ├── 上海
 *   ├── 广东
 *   └── ...
 *
 *
 * treatmentBase：
 * 当年度待遇计发基数，单位：元/月
 *
 * source：
 * 数据来源
 *
 * publishDate：
 * 公布日期
 *
 * note：
 * 备注
 *
 *
 * 目前使用 null 表示尚未填写具体官方数据。
 */

export const REGIONAL_PARAMS = {

  北京: {

    2026: {
      treatmentBase: null,
      source: "",
      publishDate: "",
      note: "",
    },

    2025: {
      treatmentBase: 12049,
      source: "https://www.beijing.gov.cn/zhengce/zhengcefagui/202511/t20251107_4265441.html",
      publishDate: "",
      note: "",
    },

    2024: {
      treatmentBase: null,
      source: "",
      publishDate: "",
      note: "",
    },
  },


  上海: {

    2026: {
      treatmentBase: null,
      source: "",
      publishDate: "",
      note: "",
    },

    2025: {
      treatmentBase: null,
      source: "",
      publishDate: "",
      note: "",
    },

    2024: {
      treatmentBase: null,
      source: "",
      publishDate: "",
      note: "",
    },
  },


  广东: {

    2026: {
      treatmentBase: null,
      source: "",
      publishDate: "",
      note: "",
    },

    2025: {
      treatmentBase: null,
      source: "",
      publishDate: "",
      note: "",
    },

    2024: {
      treatmentBase: null,
      source: "",
      publishDate: "",
      note: "",
    },
  },


  浙江: {

    2026: {
      treatmentBase: null,
      source: "",
      publishDate: "",
      note: "",
    },

    2025: {
      treatmentBase: null,
      source: "",
      publishDate: "",
      note: "",
    },
  },


  江苏: {

    2026: {
      treatmentBase: null,
      source: "",
      publishDate: "",
      note: "",
    },

    2025: {
      treatmentBase: null,
      source: "",
      publishDate: "",
      note: "",
    },
  },


  山东: {

    2026: {
      treatmentBase: null,
      source: "",
      publishDate: "",
      note: "",
    },

    2025: {
      treatmentBase: null,
      source: "",
      publishDate: "",
      note: "",
    },
  },


  四川: {

    2026: {
      treatmentBase: null,
      source: "",
      publishDate: "",
      note: "",
    },

    2025: {
      treatmentBase: null,
      source: "",
      publishDate: "",
      note: "",
    },
  },


  湖北: {

    2026: {
      treatmentBase: null,
      source: "",
      publishDate: "",
      note: "",
    },

    2025: {
      treatmentBase: null,
      source: "",
      publishDate: "",
      note: "",
    },
  },


  福建: {

    2026: {
      treatmentBase: null,
      source: "",
      publishDate: "",
      note: "",
    },

    2025: {
      treatmentBase: null,
      source: "",
      publishDate: "",
      note: "",
    },
  },


  湖南: {

    2026: {
      treatmentBase: null,
      source: "",
      publishDate: "",
      note: "",
    },

    2025: {
      treatmentBase: null,
      source: "",
      publishDate: "",
      note: "",
    },
  },


  河南: {

    2026: {
      treatmentBase: null,
      source: "",
      publishDate: "",
      note: "",
    },

    2025: {
      treatmentBase: null,
      source: "",
      publishDate: "",
      note: "",
    },
  },


  河北: {

    2026: {
      treatmentBase: null,
      source: "",
      publishDate: "",
      note: "",
    },

    2025: {
      treatmentBase: null,
      source: "",
      publishDate: "",
      note: "",
    },
  },


  辽宁: {

    2026: {
      treatmentBase: null,
      source: "",
      publishDate: "",
      note: "",
    },

    2025: {
      treatmentBase: null,
      source: "",
      publishDate: "",
      note: "",
    },
  },


  吉林: {

    2026: {
      treatmentBase: null,
      source: "",
      publishDate: "",
      note: "",
    },

    2025: {
      treatmentBase: null,
      source: "",
      publishDate: "",
      note: "",
    },
  },


  黑龙江: {

    2026: {
      treatmentBase: null,
      source: "",
      publishDate: "",
      note: "",
    },

    2025: {
      treatmentBase: null,
      source: "",
      publishDate: "",
      note: "",
    },
  },


  陕西: {

    2026: {
      treatmentBase: null,
      source: "",
      publishDate: "",
      note: "",
    },

    2025: {
      treatmentBase: null,
      source: "",
      publishDate: "",
      note: "",
    },
  },


  安徽: {

    2026: {
      treatmentBase: null,
      source: "",
      publishDate: "",
      note: "",
    },

    2025: {
      treatmentBase: null,
      source: "",
      publishDate: "",
      note: "",
    },
  },


  江西: {

    2026: {
      treatmentBase: null,
      source: "",
      publishDate: "",
      note: "",
    },

    2025: {
      treatmentBase: null,
      source: "",
      publishDate: "",
      note: "",
    },
  },


  广西: {

    2026: {
      treatmentBase: null,
      source: "",
      publishDate: "",
      note: "",
    },

    2025: {
      treatmentBase: null,
      source: "",
      publishDate: "",
      note: "",
    },
  },


  海南: {

    2026: {
      treatmentBase: null,
      source: "",
      publishDate: "",
      note: "",
    },

    2025: {
      treatmentBase: null,
      source: "",
      publishDate: "",
      note: "",
    },
  },


  重庆: {

    2026: {
      treatmentBase: null,
      source: "",
      publishDate: "",
      note: "",
    },

    2025: {
      treatmentBase: null,
      source: "",
      publishDate: "",
      note: "",
    },
  },


  贵州: {

    2026: {
      treatmentBase: null,
      source: "",
      publishDate: "",
      note: "",
    },

    2025: {
      treatmentBase: null,
      source: "",
      publishDate: "",
      note: "",
    },
  },


  云南: {

    2026: {
      treatmentBase: null,
      source: "",
      publishDate: "",
      note: "",
    },

    2025: {
      treatmentBase: null,
      source: "",
      publishDate: "",
      note: "",
    },
  },


  西藏: {

    2026: {
      treatmentBase: null,
      source: "",
      publishDate: "",
      note: "",
    },

    2025: {
      treatmentBase: null,
      source: "",
      publishDate: "",
      note: "",
    },
  },


  甘肃: {

    2026: {
      treatmentBase: null,
      source: "",
      publishDate: "",
      note: "",
    },

    2025: {
      treatmentBase: null,
      source: "",
      publishDate: "",
      note: "",
    },
  },


  青海: {

    2026: {
      treatmentBase: null,
      source: "",
      publishDate: "",
      note: "",
    },

    2025: {
      treatmentBase: null,
      source: "",
      publishDate: "",
      note: "",
    },
  },


  宁夏: {

    2026: {
      treatmentBase: null,
      source: "",
      publishDate: "",
      note: "",
    },

    2025: {
      treatmentBase: null,
      source: "",
      publishDate: "",
      note: "",
    },
  },


  新疆: {

    2026: {
      treatmentBase: null,
      source: "",
      publishDate: "",
      note: "",
    },

    2025: {
      treatmentBase: null,
      source: "",
      publishDate: "",
      note: "",
    },
  },

};


/**
 * ============================================================
 * 查询函数
 * ============================================================
 */


/**
 * 获取所有地区
 */
export function getRegions() {
  return Object.keys(REGIONAL_PARAMS);
}


/**
 * 获取指定地区支持的年份
 */
export function getRegionYears(region) {

  if (!REGIONAL_PARAMS[region]) {
    return [];
  }

  return Object.keys(REGIONAL_PARAMS[region])
    .sort((a, b) => Number(b) - Number(a));
}


/**
 * 获取指定地区、年份的完整参数
 */
export function getRegionParams(region, year) {

  if (!REGIONAL_PARAMS[region]) {
    return null;
  }

  return REGIONAL_PARAMS[region][year] || null;
}


/**
 * 获取待遇计发基数
 */
export function getTreatmentBase(region, year) {

  const params =
    getRegionParams(region, year);

  if (!params) {
    return null;
  }

  return params.treatmentBase;
}


/**
 * 获取个人账户养老金计发月数
 */
export function getPaymentMonths(age) {

  return (
    NATIONAL_PARAMS.paymentMonths[Number(age)]
    ?? null
  );
}


/**
 * 获取所有可用退休年龄
 */
export function getRetirementAges() {

  return [
    ...NATIONAL_PARAMS.retirementAges,
  ];
}