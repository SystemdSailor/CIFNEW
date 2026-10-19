#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
将 allData.json 中的数据转换并合并到 mockCompanies 格式中。

转换规则：
1. 将按省份分组的对象拍平为一个公司数组
2. 保留字段：id, name, logo, industry, scale, city, description, jobs, rating, founded, website, stockCode, englishName, tags
3. 额外补全：parent, related
4. related 字段自动计算：若两个公司的 tags 存在超过 3 个相同标签，则互相关联

输出：
- src/components/data/transformed_companies.json (JSON 格式)
"""

import json
import os
from collections import defaultdict

# 路径配置
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
# 从项目根目录的 public/allData.json
ALL_DATA_PATH = os.path.join(BASE_DIR, '..', '..', '..', 'public', 'allData.json')
# 输出到 data 目录
OUTPUT_JSON_PATH = os.path.join(BASE_DIR, 'transformed_companies.json')

# 目标字段
TARGET_FIELDS = [
    'id', 'name', 'logo', 'industry', 'scale', 'city',
    'description', 'jobs', 'rating', 'founded', 'website',
    'stockCode', 'englishName', 'tags',
    'parent', 'related'
]


def compute_related(transformed):
    """
    遍历每个项目的 tags 内容，如果和其他项目存在相同 tag 超过三个则加入到 'related' 字段。
    仅保留共同标签最多的前 5 个关联公司名称。

    Args:
        transformed: 公司列表，每个元素是包含 'id', 'tags', 'name' 等字段的字典
    """
    # 构建 id -> entry 的快速查找表
    entry_map = {entry['id']: entry for entry in transformed}

    # 解析每个公司的 tags 为集合
    company_tags = {}
    for entry in transformed:
        tags_str = entry.get('tags', '')
        if tags_str:
            tags = [tag.strip() for tag in tags_str.split(',') if tag.strip()]
        else:
            tags = []
        company_tags[entry['id']] = set(tags)

    # 用 dict 存储每个公司的关联候选（id -> 共同标签数）
    related_candidates = defaultdict(dict)

    # 比较每对公司
    company_ids = list(company_tags.keys())
    for i in range(len(company_ids)):
        for j in range(i + 1, len(company_ids)):
            id_i = company_ids[i]
            id_j = company_ids[j]

            # 计算共同标签数量
            common_tags = company_tags[id_i] & company_tags[id_j]
            common_count = len(common_tags)
            if common_count > 3:  # 相同 tag 超过三个
                related_candidates[id_i][id_j] = common_count
                related_candidates[id_j][id_i] = common_count

    # 取每个公司共同标签最多的前 5 个，存储公司名称
    for entry in transformed:
        eid = entry['id']
        if eid in related_candidates:
            # 按共同标签数降序排序，取前5个
            sorted_related = sorted(
                related_candidates[eid].items(),
                key=lambda x: x[1],
                reverse=True
            )[:5]
            # 将 id 转换为公司名称
            entry['related'] = [entry_map[rid]['name'] for rid, _ in sorted_related]
        else:
            entry['related'] = []


def transform():
    # 读取源数据
    with open(ALL_DATA_PATH, 'r', encoding='utf-8') as f:
        all_data = json.load(f)

    transformed = []
    id_counter = 1

    for province, companies in all_data.items():
        for company in companies:
            # 提取目标字段，跳过不存在的字段
            entry = {}
            for field in TARGET_FIELDS:
                if field in company:
                    entry[field] = company[field]

            # 使用原 id 保持一致性
            if 'id' in entry and entry['id'] is not None:
                entry['id'] = int(entry['id']) if isinstance(entry['id'], str) and entry['id'].isdigit() else entry['id']
            else:
                entry['id'] = id_counter

            # 确保 city 字段使用完整城市名（allData 中 city 可能是区名，使用 province）
            # 如果 company 中有 province 字段或 city 为空，用省份作为 city
            if not entry.get('city') or entry['city'] == '':
                entry['city'] = province.replace('省', '').replace('市', '').replace('自治区', '').replace('特别行政区', '')

            # 确保 industry 和 scale 字段存在
            if 'industry' not in entry:
                entry['industry'] = '其他'
            if 'scale' not in entry:
                entry['scale'] = '100-499 人'

            # 确保 jobs 为数字
            if 'jobs' in entry and entry['jobs'] is not None:
                entry['jobs'] = int(entry['jobs'])
            else:
                entry['jobs'] = 0

            # 确保 rating 为数字
            if 'rating' in entry and entry['rating'] is not None:
                entry['rating'] = float(entry['rating'])
            else:
                entry['rating'] = 3.0

            # 确保 tags 字段始终存在
            if 'tags' not in entry:
                entry['tags'] = ''

            # 确保 stockCode 和 englishName 字段始终存在
            if 'stockCode' not in entry:
                entry['stockCode'] = ''
            if 'englishName' not in entry:
                entry['englishName'] = ''

            # 确保 parent 和 related 字段始终存在（即使为空）
            if 'parent' not in entry:
                entry['parent'] = ''
            if 'related' not in entry:
                entry['related'] = []

            transformed.append(entry)
            id_counter += 1

    # 计算关联关系
    print("   正在计算关联关系（基于标签重叠）...")
    compute_related(transformed)

    # 写入 JSON 输出
    with open(OUTPUT_JSON_PATH, 'w', encoding='utf-8') as f:
        json.dump(transformed, f, ensure_ascii=False, indent=2)

    print(f"✅ 转换完成！")
    print(f"   源数据：{ALL_DATA_PATH}")
    print(f"   输出文件：{OUTPUT_JSON_PATH}")
    print(f"   源公司数量（按省份分组）：{len(all_data)} 个省份/地区")
    print(f"   转换后公司数量：{len(transformed)} 条")
    print(f"   每条记录字段：{list(transformed[0].keys()) if transformed else 'N/A'}")

    # 统计关联关系
    related_count = sum(1 for entry in transformed if entry.get('related'))
    total_relations = sum(len(entry.get('related', [])) for entry in transformed)
    print(f"   有关联的公司数：{related_count} 条")
    print(f"   总关联关系数：{total_relations} 条")


if __name__ == '__main__':
    transform()