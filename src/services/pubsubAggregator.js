/**
 * PubSub Hour Aggregator
 *
 * 功能：
 * - 订阅 PubSub topic
 * - 收集消息
 * - filter + dedup
 * - 按小时聚合
 * - 定时 flush 到 IPFS
 * - 生成 hour CID
 */

import { ipfsClient } from './ipfsDB';
import {
  saveIPFSContent,
  hasIPFSContent,
} from './indexedDBService';

class PubSubAggregator {
    constructor(options = {}) {
        // topic => Array<message>
        this.hourBuckets = new Map();

        // 保存 hour -> cid
        this.hourIndex = new Map();

        // flush 间隔
        this.flushIntervalMs = options.flushIntervalMs || 60 * 1000;

        // 最大 bucket 数量
        this.maxBucketSize = options.maxBucketSize || 1000;

        // 接收消息的 topic（上游 CID）
        this.topic = options.topic || 'test_up_cid_12345';

        // 发送 flush 结果的 topic（汇总 CID）
        this.sumTopic = options.sumTopic || 'test_sum_cid_12345';

        // timer
        this.flushTimer = null;

        // 是否启动
        this.started = false;
    }

    /**
     * 启动聚合器
     */
    async start() {
        if (this.started) {
            return;
        }

        console.log(`🚀 启动 PubSubAggregator`);

        // 订阅上游消息 topic
        await ipfsClient.pubsubSubscribe(this.topic);

        // 订阅汇总结果 topic
        await ipfsClient.pubsubSubscribe(this.sumTopic);

        // 启动消息轮询
        this.startConsumeLoop();

        // 启动定时 flush
        this.flushTimer = setInterval(async () => {
            try {
                await this.flushExpiredBuckets();
            } catch (err) {
                console.error('flushExpiredBuckets 失败:', err);
            }
        }, this.flushIntervalMs);

        this.started = true;
    }

    /**
     * 停止聚合器
     */
    async stop() {
        if (this.flushTimer) {
            clearInterval(this.flushTimer);
        }

        // flush 所有 bucket
        await this.flushAllBuckets();

        await ipfsClient.pubsubUnsubscribe(this.topic);
        await ipfsClient.pubsubUnsubscribe(this.sumTopic);

        this.started = false;

        console.log(`🛑 PubSubAggregator 已停止`);
    }

    /**
     * 消费循环
     */
    async startConsumeLoop() {
        const loop = async () => {
            while (true) {
                try {
                    const msg = await ipfsClient.pubsubPop(this.topic);

                    if (msg) {
                        await this.processMessage(msg);
                    } else {
                        // 避免空转 CPU
                        await this.sleep(500);
                    }

                } catch (err) {
                    console.error('消费消息失败:', err);

                    await this.sleep(1000);
                }
            }
        };

        loop();
    }

    /**
     * 处理消息
     */
    async processMessage(msg) {
        const filtered = this.filterMessage(msg);// 消息过滤 + 标准化

        // 被过滤
        if (!filtered) {
            return;
        }

        // 
        console.log("---- 新增：从 IPFS 读取内容并存储到 IndexedDB ----");
        try {
            // 检查是否已经存储过该 CID（避免重复读取）
            const exists = await hasIPFSContent(filtered.cid);
            if (!exists) {
                console.log(
                    `📥 正在从 IPFS 读取 CID: ${filtered.cid}`
                );
                const content = await ipfsClient.read(
                    filtered.cid
                );

                await saveIPFSContent(filtered.cid, content, {
                    title: filtered.title,
                    from: filtered.from,
                });
            } else {
                console.log(
                    `⏭️ CID 已在 IndexedDB 中，跳过: ${filtered.cid}`
                );
            }
        } catch (err) {
            // IPFS 读取或 IndexedDB 存储失败，不影响后续聚合流程
            console.error(
                `⚠️ 读取/存储 CID 内容失败: ${filtered.cid}`,
                err.message
            );
        }
        // ---- 结束新增 ----

        const hourKey = this.getHourKey(filtered.receivedAt);

        // 初始化 bucket
        if (!this.hourBuckets.has(hourKey)) {
            this.hourBuckets.set(hourKey, []);
        }

        const bucket = this.hourBuckets.get(hourKey);

        bucket.push(filtered);

        console.log(
            `📦 bucket=${hourKey}, 当前数量=${bucket.length}`
        );

        // bucket 超限立即 flush
        if (bucket.length >= this.maxBucketSize) {
            console.log(`⚠️ bucket 达到上限，立即 flush`);

            await this.flushBucket(hourKey);
        }
    }

    /**
     * 消息过滤 + 标准化
     */
    filterMessage(msg) {
        try {
            if (!msg?.data) {
                return null;
            }

            const data = msg.data;

            // 必须有 CID
            if (!data.cid) {
                return null;
            }

            // CID 必须是字符串
            if (typeof data.cid !== 'string') {
                return null;
            }

            // 标准化
            return {
                cid: data.cid,
                title: data.title || '',
                from: msg.from,
                topic: msg.topic,
                receivedAt: msg.timestamp || Date.now(),
            };

        } catch (err) {
            console.error('filterMessage 失败:', err);

            return null;
        }
    }

    /**
     * 获取小时 key
     *
     * 例如：
     * 2026-05-17-14
     */
    getHourKey(timestamp = Date.now()) {
        const d = new Date(timestamp);

        const yyyy = d.getUTCFullYear();

        const mm = String(
            d.getUTCMonth() + 1
        ).padStart(2, '0');

        const dd = String(
            d.getUTCDate()
        ).padStart(2, '0');

        const hh = String(
            d.getUTCHours()
        ).padStart(2, '0');

        return `${yyyy}-${mm}-${dd}-${hh}`;
    }

    /**
     * flush 已结束小时 bucket  start调用
     */
    async flushExpiredBuckets() {
        const currentHour = this.getHourKey();

        for (const [hourKey] of this.hourBuckets.entries()) {

            // 当前小时还在接收
            if (hourKey === currentHour) {
                continue;
            }

            await this.flushBucket(hourKey);
        }
    }

    /**
     * flush 单个 bucket
     * hourKey = "2026-05-17-14" 表示：2026-05-17 14:00 ~ 14:59 这一小时内的所有消息
     */
    async flushBucket(hourKey) {
        // 先消费 sumTopic 消息，移除本地 bucket 中已被其他节点 flush 的重复消息
        await this.consumeAndDedupFromSumTopic();

        // 获取去重后的 bucket
        const bucket = this.hourBuckets.get(hourKey);
        if (!bucket || bucket.length === 0) {
            console.log(`⏭️ hour=${hourKey} 的全部消息已被其他节点处理，跳过 flush`);
            return;
        }

        // 最终发送前按 CID 去重，保留最后一条
        const dedupMap = new Map();
        for (const msg of bucket) {
            dedupMap.set(msg.cid, msg);
        }
        const dedupedBucket = Array.from(dedupMap.values());
        if (dedupedBucket.length < bucket.length) {
            const removed = bucket.length - dedupedBucket.length;
            console.log(`🗑️ hour=${hourKey}: 最终去重移除 ${removed} 条重复 CID 消息`);
            this.hourBuckets.set(hourKey, dedupedBucket);
        }

        console.log(
            `💾 开始 flush hour bucket: ${hourKey}, count=${dedupedBucket.length}`
        );

        // 归档"文件内容"：metadata + bucket（仅含本地独有消息）
        const payload = {
            topic: this.topic,
            hour: hourKey,
            count: dedupedBucket.length,
            createdAt: Date.now(),
            messages: dedupedBucket,
        };

        // 上传到 IPFS
        try {
            const result = await ipfsClient.upload(
                JSON.stringify(payload)
            );

            const hourCid = result.cid;

            // 保存 index
            this.hourIndex.set(hourKey, {
                cid: hourCid,
                count: dedupedBucket.length,
                flushedAt: Date.now(),
            });

            console.log(
                `✅ Hour Bucket 已上传:
                hour=${hourKey}
                cid=${hourCid}
                count=${dedupedBucket.length}`
            );

            // 保存 hour index----this.hourIndex的Map内容后续再处理
            // await this.flushHourIndex(); 

            // flush 后清理内存
            this.hourBuckets.delete(hourKey);

            // 将 flush 结果（hour CID）发布到 sumTopic
            await this.publishSumResult(hourKey, hourCid, dedupedBucket.length);

        } catch (err) {
            console.error(
                `❌ flushBucket 失败: ${hourKey}`,
                err
            );
        }
    }

    /**
     * 保存 hour index
     */
    async flushHourIndex() {
        try {
            const indexObject = {
                topic: this.topic,
                updatedAt: Date.now(),
                hours: Object.fromEntries(this.hourIndex),
            };

            const result = await ipfsClient.upload(
                JSON.stringify(indexObject)
            );

            console.log(
                `📚 Hour Index CID: ${result.cid}`
            );

            this.latestIndexCid = result.cid;

        } catch (err) {
            console.error('flushHourIndex 失败:', err);
        }
    }

    /**
     * 将 flush 结果发布到 sumTopic
     *
     * 定时 flush 后将 hour bucket 的汇总 CID 发送到 test_sum_cid_12345
     * 这样订阅 test_sum_cid_12345 的节点就能收到聚合结果
     */
    async publishSumResult(hourKey, hourCid, count) {
        try {
            // 随机等待 1~10 秒，防止多节点同时 flush 时碰撞
            const delayMs = 1000 + Math.random() * 9000;
            console.log(`⏳ 等待 ${Math.round(delayMs / 1000)} 秒后发布 flush 结果到 ${this.sumTopic}`);
            await this.sleep(delayMs);

            const payload = {
                type: 'hour_flush',
                topic: this.topic,
                hour: hourKey,
                cid: hourCid,
                count,
                timestamp: Date.now(),
            };

            await ipfsClient.pubsubPublish(this.sumTopic, payload);

            console.log(
                `📤 Flush 结果已发布到 ${this.sumTopic}:
                hour=${hourKey}
                cid=${hourCid}
                count=${count}`
            );
        } catch (err) {
            console.error(
                `❌ 发布 flush 结果到 ${this.sumTopic} 失败:`,
                err
            );
        }
    }

    /**
     * flush 所有 bucket stop时调用
     */
    async flushAllBuckets() {
        for (const [hourKey] of this.hourBuckets.entries()) {
            await this.flushBucket(hourKey);
        }
    }

    /**
     * 在发布 flush 结果前，消费 sumTopic 队列中的消息，
     * 读取其他节点已 flush 的内容，从本地 hourBuckets 中移除重复消息
     */
    async consumeAndDedupFromSumTopic() {
        let dedupCount = 0;
        let msg;
        while ((msg = await ipfsClient.pubsubPop(this.sumTopic)) !== null) {
            // 每次比较前随机等待 1~10 秒，避免多节点同时消费碰撞
            const delayMs = 1000 + Math.random() * 9000;
            console.log(`⏳ consumeAndDedupFromSumTopic 等待 ${Math.round(delayMs / 1000)} 秒后处理下一条 sumTopic 消息`);
            await this.sleep(delayMs);

            const data = msg.data;
            if (!data || !data.hour || !data.cid) continue;

            const hourKey = data.hour;
            const localBucket = this.hourBuckets.get(hourKey);
            if (!localBucket || localBucket.length === 0) continue;

            try {
                // 读取其他节点已 flush 的 IPFS 内容
                const remoteRaw = await ipfsClient.read(data.cid);
                const remotePayload = JSON.parse(remoteRaw);
                const remoteMessages = remotePayload.messages || [];

                if (remoteMessages.length === 0) continue;

                // 收集其他节点消息的 cid 集合
                const remoteCids = new Set(
                    remoteMessages.map(m => m.cid)
                );

                // 从本地 bucket 中过滤掉重复的
                const before = localBucket.length;
                const deduped = localBucket.filter(
                    m => !remoteCids.has(m.cid)
                );

                if (deduped.length < before) {
                    const removed = before - deduped.length;
                    dedupCount += removed;
                    console.log(
                        `🗑️ hour=${hourKey}: 从本地 bucket 移除 ${removed} 条重复消息（其他节点已 flush）`
                    );
                    this.hourBuckets.set(hourKey, deduped);
                }

                // 将其他节点 flush 的消息（本地没有的项目）插入到 IndexedDB
                for (const remoteMsg of remoteMessages) {
                    // 以 IndexedDB 实际状态为准，已存的跳过，未存的从 IPFS 读取后保存
                    try {
                        const exists = await hasIPFSContent(remoteMsg.cid);
                        if (!exists) {
                            console.log(`📥 [dedup] 从 IPFS 读取远程消息 CID: ${remoteMsg.cid}`);
                            const content = await ipfsClient.read(remoteMsg.cid);

                            await saveIPFSContent(remoteMsg.cid, content, {
                                title: remoteMsg.title || '',
                                from: remoteMsg.from || '',
                            });
                        }
                    } catch (err) {
                        console.error(
                            `⚠️ [dedup] 保存远程消息到 IndexedDB 失败: ${remoteMsg.cid}`,
                            err.message
                        );
                    }
                }
            } catch (err) {
                console.error(`⚠️ 读取远程 flush 内容失败 (cid=${data.cid}):`, err.message);
            }
        }

        if (dedupCount > 0) {
            console.log(`✅ 共移除 ${dedupCount} 条重复消息`);
        }
    }

    /**
     * sleep
     */
    sleep(ms) {
        return new Promise(resolve => {
            setTimeout(resolve, ms);
        });
    }
}

// 单例模式
const pubsubAggregator = new PubSubAggregator({
    topic: 'test_up_cid_12345',

    // 每分钟检查
    flushIntervalMs: 60 * 1000,

    // 每小时 bucket 最大消息数
    maxBucketSize: 1000,
});

export default pubsubAggregator;