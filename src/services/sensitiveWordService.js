import { useState, useMemo, useCallback } from 'react';

/**
 * 默认敏感词列表（示例词）
 * 可根据实际需求扩展或从外部 API 加载
 */
const defaultSensitiveWords = [
  '赌博',
  '色情',
  '暴力',
  '毒品',
  '反动',
  '恐怖',
  '诈骗',
  '违禁',
  '假药',
  '枪支',
];

/**
 * 构建 DFA 前缀树
 * @param {string[]} words - 敏感词数组
 * @returns {object} DFA 前缀树对象
 */
export function buildSensitiveMap(words) {
  const map = {};
  for (const word of words) {
    let current = map;
    for (let i = 0; i < word.length; i++) {
      const char = word[i];
      if (!current[char]) {
        current[char] = { isEnd: false };
      }
      if (i === word.length - 1) {
        current[char].isEnd = true;
      }
      current = current[char];
    }
  }
  return map;
}

/**
 * 使用 DFA 算法过滤文本中的敏感词
 * @param {string} text - 待过滤的文本
 * @param {object} sensitiveMap - DFA 前缀树
 * @param {string} [replaceChar='～'] - 替换字符
 * @returns {string} 过滤后的文本
 */
export function filterSensitiveWords(text, sensitiveMap, replaceChar = '～') {
  if (!text || !sensitiveMap) return text;

  let result = '';
  let matchStart = -1;
  let current = sensitiveMap;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (current[char]) {
      // 开始或继续匹配
      if (matchStart === -1) {
        matchStart = i;
      }
      current = current[char];
      if (current.isEnd) {
        // 匹配到完整敏感词，进行替换
        result += replaceChar.repeat(i - matchStart + 1);
        matchStart = -1;
        current = sensitiveMap;
      }
    } else {
      if (matchStart !== -1) {
        // 匹配失败，回退并输出起始字符
        result += text[matchStart];
        i = matchStart;
        matchStart = -1;
        current = sensitiveMap;
      } else {
        // 未在匹配中，正常输出
        result += char;
      }
    }
  }

  // 处理末尾未完成的匹配
  if (matchStart !== -1) {
    result += text.slice(matchStart);
  }

  return result;
}

/**
 * React Hook：封装 DFA 敏感词过滤逻辑
 * @param {string[]} [words] - 自定义敏感词列表，不传则使用默认列表
 * @returns {{ filter: function, sensitiveMap: object }}
 */
export function useSensitiveWordFilter(words) {
  const [customWords] = useState(words || defaultSensitiveWords);

  const sensitiveMap = useMemo(
    () => buildSensitiveMap(customWords),
    [customWords]
  );

  const filter = useCallback(
    (text) => filterSensitiveWords(text, sensitiveMap),
    [sensitiveMap]
  );

  return { filter, sensitiveMap };
}

export default useSensitiveWordFilter;