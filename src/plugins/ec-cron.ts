/**
 * @time   2024/11/05 18:46:44
 * @author Eval
 * @description 定时任务调度
 */
import nodeCron from "node-cron";
import type {ECScheduledTask} from "../core/models";

class CronJobError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "CronJobError";
    }
}

function validateRule() {
    return function (_: EC_Cron, __: string, descriptor: PropertyDescriptor) {
        const originalMethod = descriptor.value;
        descriptor.value = function (...args: any[]) {
            const [_, rule] = args;
            if (!nodeCron.validate(rule)) {
                throw new CronJobError(`不合法的规则: ${rule}`);
            }

            return originalMethod.apply(this, args);
        };
    };
}

class EC_Cron {
    jobDict: Record<string, ECScheduledTask> = {};

    /**
     * 增加定时任务
     * @param key
     * @param rule
     * @param callback
     */
    @validateRule()
    startCronJob(key: string, rule: string, callback: (now: Date | "manual" | "init") => void): ECScheduledTask {
        if (this.jobDict[key]) {
            this.stopCronJob(key);
        }
        const job = nodeCron.schedule(rule, callback, {
            scheduled: true,
            timezone: "Asia/Shanghai",
            name: key,
        }) as ECScheduledTask;
        job.name = key;
        this.jobDict[key] = job;
        job.start();
        return job;
    }

    /**
     * 删除定时任务
     * @param key
     */
    stopCronJob(job: ECScheduledTask | string) {
        if (typeof job === "string") {
            job = this.jobDict[job];
            delete this.jobDict[String(job)];
        }
        job.stop();
    }

    /**
     * 获取所有定时任务
     * @returns
     */
    getAllJobs() {
        return Object.keys(this.jobDict).map((key) => ({
            key,
            job: this.jobDict[key],
        }));
    }

    /**
     * 清空所有定时任务
     */
    clearAllJobs() {
        for (const key in this.jobDict) {
            this.stopCronJob(key);
        }
    }
}

EC_Cron.toString = () => "[class EC_Cron]";
export default EC_Cron;
