declare namespace Deno {
  export interface env {
    get(key: string): string | undefined;
  }
}

declare module "std/http/server.ts" {
  export interface ServeInit {
    port?: number;
    hostname?: string;
    handler?: (request: Request) => Response | Promise<Response>;
  }
  
  export function serve(
    handler: (request: Request) => Response | Promise<Response>,
    init?: ServeInit
  ): void;
}

declare module "resend" {
  export class Resend {
    constructor(apiKey: string);
    emails: {
      send(options: {
        from: string;
        to: string[];
        subject: string;
        html: string;
      }): Promise<any>;
    };
  }
}
