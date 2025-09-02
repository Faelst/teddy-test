export class UniqueConstraintError extends Error {
  constructor(public readonly target?: string | string[]) {
    super('UNIQUE_CONSTRAINT');
  }
}

export class NotFoundError extends Error {
  constructor() {
    super('NOT_FOUND');
  }
}
