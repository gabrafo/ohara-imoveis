import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SetMetadata } from '@nestjs/common';

export const SKIP_RESOURCE_OWNER_CHECK = 'skipResourceOwnerCheck';
export const SkipResourceOwnerCheck = () => SetMetadata(SKIP_RESOURCE_OWNER_CHECK, true);

@Injectable()
export class ResourceOwnerGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const skipCheck = this.reflector.getAllAndOverride<boolean>(SKIP_RESOURCE_OWNER_CHECK, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (skipCheck) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const params = request.params;

    if (user.role === 'ADMIN') {
      return true;
    }

    const resourceUserId = parseInt(params.userId) || parseInt(params.id);
    
    if (!resourceUserId) {
      throw new ForbiddenException('ID do usuário não encontrado na requisição.');
    }

    if (user.userId !== resourceUserId) {
      throw new ForbiddenException('Você não tem permissão para acessar este recurso.');
    }

    return true;
  }
}