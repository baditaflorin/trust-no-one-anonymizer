/// <reference types="vite/client" />

declare const __APP_VERSION__: string;
declare const __APP_COMMIT__: string;
declare const __REPO_URL__: string;
declare const __PAYPAL_URL__: string;

declare module '@jitsi/rnnoise-wasm' {
  export interface RnnoiseWasmModule {
    HEAPF32: Float32Array;
    _malloc(size: number): number;
    _free(pointer: number): void;
    _rnnoise_create(): number;
    _rnnoise_destroy(state: number): void;
    _rnnoise_process_frame(state: number, output: number, input: number): number;
  }

  export function createRNNWasmModule(): Promise<RnnoiseWasmModule>;
  export function createRNNWasmModuleSync(): RnnoiseWasmModule;
}
