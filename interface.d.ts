export interface IElectronAPI {
    IPCcontrol: () => Promise<void>;
}

declare global {
    interface Window {
        electronAPI: IElectronAPI;
    }
}
