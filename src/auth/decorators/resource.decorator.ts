import { SetMetadata } from '@nestjs/common';

export const Resource = (resource: string) => SetMetadata('resource', resource);
export const IdParam = (param: string) => SetMetadata('idParam', param);