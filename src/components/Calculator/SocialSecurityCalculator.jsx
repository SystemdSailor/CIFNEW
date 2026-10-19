import React, { useMemo, useState } from "react";

import {
  NATIONAL_PARAMS,
  getRegions,
  getRegionYears,
  getTreatmentBase,
  getPaymentMonths,
} from "./socialSecurityParams";

import "./SocialSecurityCalculator.css";


/**
 * ============================================================
 * 工具函数
 * ============================================================
 */


/**
 * 金额格式化
 */
function formatMoney(value) {

  if (!Number.isFinite(value)) {
    return "0.00";
  }

  return value.toLocaleString("zh-CN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}


/**
 * 数字格式化
 */
function formatNumber(value) {

  if (!Number.isFinite(value)) {
    return "0";
  }

  return value.toLocaleString("zh-CN", {
    maximumFractionDigits: 2,
  });
}


/**
 * ============================================================
 * Component
 * ============================================================
 */

function SocialSecurityCalculator() {

  /**
   * ==========================================================
   * 地区
   * ==========================================================
   */

  const regions = getRegions();

  const defaultRegion =
    regions.includes("北京")
      ? "北京"
      : regions[0] || "";

  const [region, setRegion] =
    useState(defaultRegion);


  /**
   * ==========================================================
   * 年份
   * ==========================================================
   */

  const initialYears =
    getRegionYears(defaultRegion);

  const defaultYear =
    initialYears[0] || "";

  const [year, setYear] =
    useState(defaultYear);


  /**
   * ==========================================================
   * 用户输入
   * ==========================================================
   */

  /**
   * 本人平均缴费工资指数
   */
  const [averageIndex, setAverageIndex] =
    useState("");


  /**
   * 缴费年限
   *
   * 这个值同时用于：
   *
   * 1. 基础养老金计算
   *
   * 2. 按月缴费模式计算个人账户储存额
   */
  const [paymentYears, setPaymentYears] =
    useState("");


  /**
   * ==========================================================
   * 个人账户储存额
   * ==========================================================
   *
   * accountMode:
   *
   * balance
   *   直接输入退休时个人账户储存额
   *
   * monthly
   *   输入每月个人账户缴费金额
   *
   * 注意：
   *
   * 按月缴费模式下，缴费年限直接使用上面的
   * paymentYears，不再单独设置缴费年限。
   */
  const [accountMode, setAccountMode] =
    useState("balance");


  /**
   * 每月个人账户缴费金额
   */
  const [
    monthlyAccountContribution,
    setMonthlyAccountContribution,
  ] = useState("");


  /**
   * 直接输入的个人账户储存额
   */
  const [
    accountBalance,
    setAccountBalance,
  ] = useState("");


  /**
   * 退休年龄
   */
  const [retirementAge, setRetirementAge] =
    useState("60");


  /**
   * 是否手动输入待遇计发基数
   *
   * 当数据文件中没有该年度数据时，
   * 用户可以手动输入。
   */
  const [manualBase, setManualBase] =
    useState("");


  /**
   * ==========================================================
   * 当前地区支持的年份
   * ==========================================================
   */

  const availableYears =
    useMemo(() => {

      return getRegionYears(region);

    }, [region]);


  /**
   * ==========================================================
   * 根据地区 + 年份自动获取待遇计发基数
   * ==========================================================
   */

  const configuredBase =
    getTreatmentBase(region, year);


  /**
   * ==========================================================
   * 最终使用的待遇计发基数
   * ==========================================================
   *
   * 如果参数文件有数据：
   *
   *     使用参数文件中的基数
   *
   * 如果参数文件为 null：
   *
   *     使用用户手动输入
   */

  const treatmentBase =
    configuredBase !== null &&
    configuredBase !== undefined

      ? configuredBase

      : Number(manualBase) || 0;


  /**
   * ==========================================================
   * 个人账户储存额
   * ==========================================================
   *
   * 直接输入模式：
   *
   *     accountBalance
   *
   * 按月缴费模式：
   *
   *     每月个人账户缴费金额
   *     × 12
   *     × 缴费年限
   *
   * 其中缴费年限直接使用 paymentYears。
   */

  const calculatedAccountBalance =
    accountMode === "balance"

      ? Number(accountBalance || 0)

      : Number(monthlyAccountContribution || 0)
        * 12
        * Number(paymentYears || 0);


  /**
   * ==========================================================
   * 退休年龄 → 计发月数
   * ==========================================================
   */

  const paymentMonths =
    getPaymentMonths(retirementAge);


  /**
   * ==========================================================
   * 计算
   * ==========================================================
   */

  const calculation =
    useMemo(() => {

      const G =
        Number(treatmentBase);

      const I =
        Number(averageIndex);

      const Y =
        Number(paymentYears);

      /**
       * 这里不再直接使用 accountBalance。
       *
       * 而是使用：
       *
       * calculatedAccountBalance
       *
       * 这样 Toggle 切换后，
       * 后续养老金计算会自动跟着变化。
       */
      const A =
        Number(calculatedAccountBalance);

      const M =
        Number(paymentMonths);


      /**
       * ------------------------------------------
       * 本人指数化月平均缴费工资
       * ------------------------------------------
       *
       * = 待遇计发基数 × 本人平均缴费工资指数
       */

      const indexedMonthlySalary =
        G > 0 && I >= 0

          ? G * I

          : 0;


      /**
       * ------------------------------------------
       * 基础养老金
       * ------------------------------------------
       *
       * =
       *
       * (
       *   待遇计发基数
       *   +
       *   本人指数化月平均缴费工资
       * )
       * ÷ 2
       * × 缴费年限
       * × 1%
       */

      const basicPension =
        G > 0 &&
        I >= 0 &&
        Y > 0

          ? (
              (G + indexedMonthlySalary)
              / 2
            )
            * Y
            * NATIONAL_PARAMS.basicPensionRate

          : 0;


      /**
       * ------------------------------------------
       * 个人账户养老金
       * ------------------------------------------
       *
       * = 个人账户储存额 ÷ 计发月数
       */

      const accountPension =
        A >= 0 &&
        M > 0

          ? A / M

          : 0;


      /**
       * ------------------------------------------
       * 总养老金
       * ------------------------------------------
       */

      const totalPension =
        basicPension +
        accountPension;


      return {

        indexedMonthlySalary,

        basicPension,

        accountPension,

        totalPension,

        paymentMonths: M,

        /**
         * 将最终使用的个人账户储存额
         * 一并放入 calculation。
         *
         * Render 区域直接使用这个值，
         * 避免出现 Toggle 已经切换，
         * 但是页面仍然显示旧 accountBalance 的问题。
         */
        accountBalance: A,

      };

    }, [
      treatmentBase,
      averageIndex,
      paymentYears,
      calculatedAccountBalance,
      paymentMonths,
    ]);


  /**
   * ==========================================================
   * 切换地区
   * ==========================================================
   */

  function handleRegionChange(event) {

    const newRegion =
      event.target.value;

    setRegion(newRegion);


    const years =
      getRegionYears(newRegion);


    /**
     * 自动选择最新年份
     */
    if (years.length > 0) {

      setYear(years[0]);

    } else {

      setYear("");

    }


    /**
     * 清空手动输入
     */
    setManualBase("");
  }


  /**
   * ==========================================================
   * 切换年份
   * ==========================================================
   */

  function handleYearChange(event) {

    setYear(event.target.value);

    setManualBase("");
  }


  /**
   * ==========================================================
   * 重置
   * ==========================================================
   */

  function handleReset() {

    setRegion(defaultRegion);

    setYear(defaultYear);

    setAverageIndex("");

    setPaymentYears("");

    setAccountBalance("");

    setMonthlyAccountContribution("");

    setAccountMode("balance");

    setRetirementAge("60");

    setManualBase("");
  }


  /**
   * ==========================================================
   * 判断是否使用参数文件中的基数
   * ==========================================================
   */

  const usingConfiguredBase =
    configuredBase !== null &&
    configuredBase !== undefined;


  /**
   * ==========================================================
   * Render
   * ==========================================================
   */

  return (

    <section className="social-security-calculator">


      {/* ====================================================
          Header
      ==================================================== */}

      <header className="ssc-header">

        <div>

          <h2 className="ssc-title">
            社保养老金计算器
          </h2>

          <div className="ssc-subtitle">
            基础养老金 + 个人账户养老金
          </div>

        </div>


        <button
          type="button"
          className="ssc-reset"
          onClick={handleReset}
        >
          重置
        </button>

      </header>


      {/* ====================================================
          参数区域
      ==================================================== */}

      <div className="ssc-input-area">


        {/* ==================================================
            地区
        ================================================== */}

        <div className="ssc-field">

          <label>
            参保地区
          </label>

          <select
            value={region}
            onChange={handleRegionChange}
          >

            {regions.map((item) => (

              <option
                key={item}
                value={item}
              >
                {item}
              </option>

            ))}

          </select>

        </div>


        {/* ==================================================
            年份
        ================================================== */}

        <div className="ssc-field">

          <label>
            退休年度
          </label>

          <select
            value={year}
            onChange={handleYearChange}
          >

            {availableYears.map((item) => (

              <option
                key={item}
                value={item}
              >
                {item} 年
              </option>

            ))}

          </select>

        </div>


        {/* ==================================================
            待遇计发基数
        ================================================== */}

        <div className="ssc-field">

          <label>

            待遇计发基数

            <span>
              元/月
            </span>

          </label>


          <input
            type="number"
            min="0"
            step="0.01"
            value={
              usingConfiguredBase
                ? configuredBase
                : manualBase
            }
            onChange={(event) => {

              if (!usingConfiguredBase) {

                setManualBase(
                  event.target.value
                );

              }

            }}
            readOnly={usingConfiguredBase}
            placeholder={
              usingConfiguredBase
                ? ""
                : "请输入基数"
            }
          />


          <div className="ssc-field-hint">

            {usingConfiguredBase
              ? `${region} ${year} 年参数`
              : "参数库暂无数据，请手动输入"}

          </div>

        </div>


        {/* ==================================================
            平均缴费工资指数
        ================================================== */}

        <div className="ssc-field">

          <label>

            本人平均缴费工资指数

            <span>
              指数
            </span>

          </label>


          <input
            type="number"
            min="0"
            step="0.01"
            value={averageIndex}
            onChange={(event) =>
              setAverageIndex(
                event.target.value
              )
            }
            placeholder="例如 1.2"
          />

        </div>


        {/* ==================================================
            缴费年限
        ================================================== */}

        <div className="ssc-field">

          <label>

            缴费年限

            <span>
              年
            </span>

          </label>


          <input
            type="number"
            min="0"
            step="0.01"
            value={paymentYears}
            onChange={(event) =>
              setPaymentYears(
                event.target.value
              )
            }
            placeholder="例如 30"
          />

        </div>


        {/* ==================================================
            个人账户储存额
        ================================================== */}

        <div className="ssc-field">

          <div className="ssc-account-header">

            <label>
              个人账户储存额
            </label>


            {/* Toggle */}

            <div className="ssc-toggle">

              <button
                type="button"
                className={
                  accountMode === "balance"
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setAccountMode("balance")
                }
              >
                总计
              </button>


              <button
                type="button"
                className={
                  accountMode === "monthly"
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setAccountMode("monthly")
                }
              >
                按月
              </button>

            </div>

          </div>


          {/* ==================================================
              直接输入
              ================================================== */}

          {accountMode === "balance" && (

            <>

              <div className="ssc-input-unit">

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={accountBalance}
                  onChange={(event) =>
                    setAccountBalance(
                      event.target.value
                    )
                  }
                  placeholder="例如 250000"
                />

                <span>
                  元
                </span>

              </div>


              <div className="ssc-field-hint">

                直接输入预计退休时个人账户储存额

              </div>

            </>

          )}


          {/* ==================================================
              按月缴费
              ================================================== */}

          {accountMode === "monthly" && (

            <>

              <div className="ssc-input-unit">

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={monthlyAccountContribution}
                  onChange={(event) =>
                    setMonthlyAccountContribution(
                      event.target.value
                    )
                  }
                  placeholder="例如 1000"
                />

                <span>
                  元/月
                </span>

              </div>


              {/* 自动使用上面的缴费年限 */}

              <div className="ssc-account-calc">

                <span>
                  ×
                </span>

                <strong>
                  {paymentYears || "0"}
                </strong>

                <span>
                  年
                </span>

              </div>


              {/* 计算结果 */}

              <div className="ssc-account-result">

                <span>
                  估算个人账户储存额
                </span>

                <strong>

                  ¥{" "}
                  {formatMoney(
                    calculatedAccountBalance
                  )}

                </strong>

              </div>


              <div className="ssc-field-hint">

                每月个人账户缴费金额 × 12 × 缴费年限

              </div>

            </>

          )}

        </div>


        {/* ==================================================
            退休年龄
        ================================================== */}

        <div className="ssc-field">

          <label>

            退休年龄

            <span>
              周岁
            </span>

          </label>


          <select
            value={retirementAge}
            onChange={(event) =>
              setRetirementAge(
                event.target.value
              )
            }
          >

            {NATIONAL_PARAMS.retirementAges.map(
              (age) => (

                <option
                  key={age}
                  value={age}
                >
                  {age} 周岁
                </option>

              )
            )}

          </select>


          <div className="ssc-field-hint">

            计发月数：
            {paymentMonths ?? "--"}
            月

          </div>

        </div>

      </div>


      {/* ====================================================
          结果
      ==================================================== */}

      <div className="ssc-result">

        <div className="ssc-result-main">

          <div className="ssc-result-label">
            预计月基本养老金
          </div>


          <div className="ssc-total">

            ¥{" "}
            {formatMoney(
              calculation.totalPension
            )}

            <span>
              /月
            </span>

          </div>

        </div>


        <div className="ssc-result-items">


          {/* 基础养老金 */}

          <div className="ssc-result-item">

            <span>
              基础养老金
            </span>

            <strong>
              ¥{" "}
              {formatMoney(
                calculation.basicPension
              )}
            </strong>

          </div>


          {/* 个人账户养老金 */}

          <div className="ssc-result-item">

            <span>
              个人账户养老金
            </span>

            <strong>
              ¥{" "}
              {formatMoney(
                calculation.accountPension
              )}
            </strong>

          </div>


          {/* 个人账户储存额 */}

          <div className="ssc-result-item">

            <span>
              个人账户储存额
            </span>

            <strong>
              ¥{" "}
              {formatMoney(
                calculation.accountBalance
              )}
            </strong>

          </div>


          {/* 计发月数 */}

          <div className="ssc-result-item">

            <span>
              个人账户计发月数
            </span>

            <strong>

              {calculation.paymentMonths || "--"}

              <small>
                月
              </small>

            </strong>

          </div>

        </div>

      </div>
      <details className="ssc-extra">
        <summary>查看计算过程、计发月数对照表和说明</summary>

      {/* ====================================================
          计算过程
      ==================================================== */}

      <div className="ssc-detail">

        <div className="ssc-section-title">
          计算过程
        </div>


        <div className="ssc-formula-list">


          {/* ==================================================
              本人指数化月平均缴费工资
              ================================================== */}

          <div className="ssc-formula">

            <div className="ssc-formula-name">
              本人指数化月平均缴费工资
            </div>

            <div className="ssc-formula-value">

              ¥{" "}
              {formatMoney(
                calculation.indexedMonthlySalary
              )}

            </div>

            <div className="ssc-formula-expression">

              {formatNumber(treatmentBase)}

              {" × "}

              {averageIndex ||
                "平均缴费工资指数"}

            </div>

          </div>


          {/* ==================================================
              基础养老金
              ================================================== */}

          <div className="ssc-formula">

            <div className="ssc-formula-name">
              基础养老金
            </div>

            <div className="ssc-formula-value">

              ¥{" "}
              {formatMoney(
                calculation.basicPension
              )}

            </div>

            <div className="ssc-formula-expression">

              (

              {formatNumber(treatmentBase)}

              {" + "}

              {formatNumber(
                calculation.indexedMonthlySalary
              )}

              )

              {" ÷ 2 × "}

              {paymentYears ||
                "缴费年限"}

              {" × 1%"}

            </div>

          </div>


          {/* ==================================================
              个人账户储存额
              ================================================== */}

          <div className="ssc-formula">

            <div className="ssc-formula-name">
              个人账户储存额
            </div>


            <div className="ssc-formula-value">

              ¥{" "}
              {formatMoney(
                calculation.accountBalance
              )}

            </div>


            <div className="ssc-formula-expression">

              {accountMode === "monthly"

                ? (
                    <>
                      {monthlyAccountContribution ||
                        "每月个人账户缴费金额"}

                      {" × 12 × "}

                      {paymentYears ||
                        "缴费年限"}

                    </>
                  )

                : (
                    <>
                      直接输入退休时个人账户储存额
                    </>
                  )}

            </div>

          </div>


          {/* ==================================================
              个人账户养老金
              ================================================== */}

          <div className="ssc-formula">

            <div className="ssc-formula-name">
              个人账户养老金
            </div>


            <div className="ssc-formula-value">

              ¥{" "}
              {formatMoney(
                calculation.accountPension
              )}

            </div>


            <div className="ssc-formula-expression">

              {formatNumber(
                calculation.accountBalance
              )}

              {" ÷ "}

              {paymentMonths ||
                "计发月数"}

            </div>

          </div>

        </div>

      </div>


      {/* ====================================================
          计发月数表
      ==================================================== */}

      <div className="ssc-month-table">

        <div className="ssc-section-title">

          个人账户养老金计发月数

        </div>


        <div className="ssc-month-grid">

          {NATIONAL_PARAMS
            .retirementAges
            .map((age) => {

              const months =
                getPaymentMonths(age);

              const active =
                Number(retirementAge) === age;


              return (

                <div
                  key={age}
                  className={
                    `ssc-month-item ${
                      active
                        ? "active"
                        : ""
                    }`
                  }
                >

                  <span>
                    {age} 岁
                  </span>

                  <strong>
                    {months}

                    <small>
                      月
                    </small>

                  </strong>

                </div>

              );

            })}

        </div>

      </div>


      {/* ====================================================
          参数说明
      ==================================================== */}

      <div className="ssc-notice">

        <div className="ssc-notice-title">
          参数说明
        </div>


        <p>

          当前选择：

          <strong>
            {region}
          </strong>

          {" "}

          <strong>
            {year}
          </strong>

          年。

        </p>


        <p>

          待遇计发基数：

          {usingConfiguredBase

            ? `使用参数库中的 ${formatMoney(
                configuredBase
              )} 元/月`

            : "当前参数库没有该年度数据，请手动输入。"}

        </p>


        <p>

          个人账户养老金计发月数按照
          退休年龄从国家统一参数表中取得。

        </p>


        {accountMode === "monthly" && (

          <p>

            当前个人账户储存额采用按月缴费估算：

            <strong>
              每月个人账户缴费金额 × 12 × 缴费年限
            </strong>

          </p>

        )}


        <p className="ssc-warning">

          本工具仅按照输入参数和参数库中的公式
          进行数学计算，不能替代人力资源和社会保障
          部门最终的退休待遇核定结果。

        </p>

      </div>
      </details>

    </section>
  );
}


export default SocialSecurityCalculator;