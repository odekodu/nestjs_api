import { Controller, Get, Post, Body, Patch, Param, Delete, UsePipes, HttpStatus, Query, CacheKey, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { ApiHeader, ApiParam, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { JoiValidationPipe } from '../../pipes/joi-validation.pipe';
import { CreateUserValidator } from './validators/create-user.validator';
import { ErrorResponse } from '../../errors/error.response';
import { IdValidator } from '../../shared/id.validator';
import { SortEnum } from '../../shared/sort.enum';
import { RedisCacheKeys } from '../../redis-cache/redis-cache.keys';
import { ListUsersResponse } from './responses/list-users.response';
import { UserResponse } from './responses/user.response';
import { CacheClear } from '../../decorators/cache-clear.decorator';
import { AuthorizeGuard } from '../../guards/authorize.guard';
import { RolesGuard } from '../../guards/roles.guard';
import { AccessRights } from '../../shared/access.right';
import { ListUsersValidator } from './validators/list-users.validator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiResponse({ status: HttpStatus.CREATED, type: UserResponse})
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, type: ErrorResponse })
  @ApiResponse({ status: HttpStatus.CONFLICT, type: ErrorResponse })
  @UsePipes(new JoiValidationPipe(CreateUserValidator))
  @CacheClear(RedisCacheKeys.LIST_USERS, RedisCacheKeys.GET_USER)
  @Post()
  createUser(
    @Body() createUserDto: CreateUserDto
  ) {    
    return this.usersService.createUser(createUserDto);
  }

  @ApiHeader({ name: 'authorization', required: true })
  @UseGuards(AuthorizeGuard, new RolesGuard([AccessRights.ADMIN, AccessRights.SUPERADMIN]))
  @ApiQuery({ name: 'limit', required: false, description: 'The max number of users to fetch', type: Number })
  @ApiQuery({ name: 'offset', required: false, description: 'The page number to fetch', type: Number })
  @ApiQuery({ name: 'sort', required: false, description: 'The order of sorting', enum: SortEnum, type: String })
  @ApiQuery({ name: 'query', required: false, description: 'The query for searching users', type: String })
  @ApiResponse({ status: HttpStatus.OK, type: ListUsersResponse })
  @CacheKey(RedisCacheKeys.LIST_USERS)
  @Get()
  listUsers(
    @Query(new JoiValidationPipe(ListUsersValidator)) { limit, offset, sort, query }: any
  ) {
    return this.usersService.listUsers(limit, offset, sort, query);
  }

  @ApiHeader({ name: 'authorization', required: true })
  @UseGuards(AuthorizeGuard)
  @ApiParam({ name: 'id', required: true, description: 'The id of the user' })
  @ApiResponse({ status: HttpStatus.OK, type: UserResponse })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, type: ErrorResponse })
  @CacheKey(RedisCacheKeys.GET_USER)
  @Get(':id')
  getUser(
    @Param('id', new JoiValidationPipe(IdValidator())
  ) id: string) {    
    return this.usersService.getUser(id);
  }
}
