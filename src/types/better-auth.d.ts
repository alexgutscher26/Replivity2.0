/* eslint-disable @typescript-eslint/no-redundant-type-constituents */
import 'better-auth';

declare module 'better-auth' {
  export interface AuthOptions {
    emailAndPassword?: {
      password?: {
        hash?: (password: string) => Promise<string>;
        verify?: (data: { hash: string; password: string }) => Promise<boolean>;
      };
    } & EmailAndPasswordOptions;
  }
}

