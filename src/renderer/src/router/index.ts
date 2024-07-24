import {createRouter, createWebHashHistory} from "vue-router";

const routes = [
    {
        path: "/",
        name: "Index",
        component: () => import("@renderer/views/Index/Index.vue"),
    },
];

const router = createRouter({
    history: createWebHashHistory(),
    routes,
});

router.beforeResolve(() => {
    if (document.title == "Electron") {
        document.title = "EC框架 @Eval";
    }
});
export default router;
