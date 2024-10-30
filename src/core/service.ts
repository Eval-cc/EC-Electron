/**
 * @time   2024/07/24 10:31:29
 * @author Eval
 * @description 服务注册类
 */
import {IPCModelTypeMain} from "../core/models";

export class Service {
    private static contro: any = new Map();

    constructor() {
        // 获取原型链上的所有方法名
        const methodNames = Object.getOwnPropertyNames(Object.getPrototypeOf(this)).filter((name) => name !== "constructor");

        // 将每个方法存储在 contro 中，使用 Symbol 作为键
        methodNames.forEach((name: string) => {
            if (Service.contro.get(name)) {
                throw new Error("注入失败,重复的脚本:" + name);
            }
            const method = this[name];
            Service.contro.set(name, method.bind(this));
        });
    }

    /**
     * 执行注入的方法
     * @param name
     * @param data
     * @returns
     */
    static Invoke(name: string, data: IPCModelTypeMain) {
        // 如果没有找到注入的方法，则抛出异常
        if (!Service.contro.get(name)) {
            throw new Error(`[未将对象引用设置到对象的实例] ${name}`);
        }
        return Service.contro.get(name)(data);
    }
}
