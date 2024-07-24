/**
 * @time   2024/07/24 10:35:39
 * @author Eval
 * @description 测试服务类
 */
import {Service} from "../core/service";
import {IPCResult} from "../core/IPCResult";

export default class Test extends Service {
    constructor() {
        super();
    }

    test() {
        return IPCResult(true, "我是测试注入的方法");
    }
}
