import { App } from 'vue';
/** App cleanup compatible with Vue 3.4, without global mixins or DOM on import. */
export declare function onWlAppUnmount(app: App, cleanup: () => void): void;
