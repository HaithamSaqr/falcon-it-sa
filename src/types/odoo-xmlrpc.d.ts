declare module "odoo-xmlrpc" {
  interface OdooConfig {
    url: string;
    db: string;
    username: string;
    password: string;
  }

  class Odoo {
    constructor(config: OdooConfig);
    connect(callback: (err: Error | null) => void): void;
    execute_kw(
      model: string,
      method: string,
      params: unknown[],
      callback: (err: Error | null, result: unknown) => void
    ): void;
  }

  export = Odoo;
}
