// Global type definitions for NodeJS, ImportMetaEnv, and other missing types
declare namespace NodeJS {
  interface ProcessEnv {
    [key: string]: string | undefined;
  }
}

declare interface ImportMetaEnv {
  [key: string]: string | undefined;
}

declare var process: NodeJS.ProcessEnv;
declare var console: Console;
declare var Deno: any;
declare var require: any;
declare var __dirname: string;

declare class DataSyncService {}
