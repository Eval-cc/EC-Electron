module.exports = {
    install(GlobalStatus) {
        GlobalStatus.control.SendRenderMsgToAll({success: true, msg: "注册插件服务成功", data: {type: "dialog"}});
        let index = 6;
        GlobalStatus.control.SendRenderMsgToAll({success: true, msg: "5秒之后关闭窗体", data: {type: "dialog"}});
        const timer = setInterval(() => {
            GlobalStatus.control.SendRenderMsgToAll({success: true, msg: index + "秒之后关闭窗体"});
            if (index === 0) {
                clearInterval(timer);
                GlobalStatus.core.closeWin(1);
            }
            index--;

            if (index === 1) {
                GlobalStatus.control.SendRenderMsgToAll({success: true, msg: "再见!!!!", data: {type: "loading"}});
            }
        }, 1000);
    },
};
