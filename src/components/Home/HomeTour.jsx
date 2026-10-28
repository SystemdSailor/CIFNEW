import { useCallback, useEffect, useRef, useState } from 'react';
import introJs from 'intro.js';
import 'intro.js/introjs.css';
import './HomeTour.css';
import {
  AUTO_START_HOME_TOUR,
  HOME_TOUR_STEPS,
  HOME_TOUR_STORAGE_KEY,
} from './homeTourConfig';
import { resolveHomeTourSteps } from './homeTourTargets';

const TOUR_OPTIONS = {
  nextLabel: '下一步',
  prevLabel: '上一步',
  doneLabel: '完成',
  skipLabel: '跳过',
  showProgress: true,
  showBullets: false,
  showStepNumbers: false,
  exitOnEsc: true,
  exitOnOverlayClick: false,
  scrollToElement: true,
  disableInteraction: true,
  helperElementPadding: 6,
  tooltipClass: 'home-tour-tooltip',
};

/** 是否已经看过引导（localStorage 不可用时按未看过处理） */
const hasSeenTour = () => {
  try {
    return window.localStorage.getItem(HOME_TOUR_STORAGE_KEY) === '1';
  } catch {
    return false;
  }
};

/** 记录引导已看过（隐私模式下 localStorage 可能不可用，忽略即可） */
const markTourAsSeen = () => {
  try {
    window.localStorage.setItem(HOME_TOUR_STORAGE_KEY, '1');
  } catch {
    // 不影响本次引导
  }
};

/**
 * 首页新手引导（仅用于首页列表视图）
 *
 * - 首次进入首页时自动弹出一次，之后不再自动弹出；
 * - 右下角固定显示「使用说明」按钮，可随时重播；
 * - 所有说明文案集中在 homeTourConfig.js，目前为占位符 *****。
 *
 * @param {boolean} autoStart 是否首次自动弹出
 * @param {number} startDelay 自动弹出延迟（毫秒），等待首页布局稳定
 * @param {Array} steps 引导步骤配置
 */
const HomeTour = ({
  autoStart = AUTO_START_HOME_TOUR,
  startDelay = 700,
  steps = HOME_TOUR_STEPS,
}) => {
  const [isTourRunning, setIsTourRunning] = useState(false);
  const tourRef = useRef(null);
  const isMountedRef = useRef(true);

  const startTour = useCallback(() => {
    // 已有引导实例时避免重复启动
    if (tourRef.current) return false;

    // 运行时解析目标，自动跳过当前页面上不存在的步骤
    const availableSteps = resolveHomeTourSteps(steps);
    if (availableSteps.length === 0) return false;

    const tour = introJs.tour().setOptions({
      ...TOUR_OPTIONS,
      steps: availableSteps,
    });
    tourRef.current = tour;

    const handleFinish = () => {
      markTourAsSeen();
      tourRef.current = null;
      if (isMountedRef.current) setIsTourRunning(false);
    };

    // 完成、跳过、主动退出都视为已看过，避免下次自动打扰
    tour.onComplete(handleFinish);
    tour.onSkip(handleFinish);
    tour.onExit(handleFinish);

    setIsTourRunning(true);
    const startResult = tour.start();
    if (startResult && typeof startResult.catch === 'function') {
      startResult.catch(() => {
        tourRef.current = null;
        if (isMountedRef.current) setIsTourRunning(false);
      });
    }

    return true;
  }, [steps]);

  // 首次进入首页自动弹出（StrictMode 下由 cleanup 清掉第一次的定时器）
  useEffect(() => {
    if (!autoStart || hasSeenTour()) return undefined;

    const timer = window.setTimeout(() => {
      if (!hasSeenTour()) startTour();
    }, startDelay);

    return () => window.clearTimeout(timer);
  }, [autoStart, startDelay, startTour]);

  // 组件卸载（如浏览器后退离开首页）时关闭引导，避免遮罩层残留
  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
      const activeTour = tourRef.current;
      tourRef.current = null;
      if (activeTour && typeof activeTour.exit === 'function') {
        Promise.resolve(activeTour.exit(true)).catch(() => {});
      }
    };
  }, []);

  // 引导进行中隐藏重播按钮，避免与 Intro.js 遮罩层叠加
  if (isTourRunning) return null;

  return (
    <button
      type="button"
      className="home-tour-trigger"
      onClick={startTour}
      aria-label="打开首页使用说明"
      title="首页使用说明"
    >
      <span className="home-tour-trigger__icon" aria-hidden="true">?</span>
      <span className="home-tour-trigger__label">使用说明</span>
    </button>
  );
};

export default HomeTour;
