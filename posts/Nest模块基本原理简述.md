---
title: Nest模块基本原理简述
date: 2024-10-16
category: 前端开发
top: false
tags:
  - NestJs
description: '总结NestJs应用基本原理，以及模块和提供者之间的关系和使用'
---

# Nest模块简述

## Provider

`Module` 装饰器中，入参约定了 controllers、providers、imports三者，对应模块使用的控制器、提供的实例、要导入的模块

```typescript
import { Module } from '@nestjs/common';
import { CatsController } from './cats/cats.controller';
import { CatsService } from './cats/cats.service';

@Module({
  controllers: [CatsController],
  providers: [CatsService],
  imports:[]
})
export class AppModule {}
```

* 这其中的过程可以简述为：*

1. **cats.service 中使用了 @Injectable 声明该类可以由IoC容器进行实例化管理**
2. **cats.controller 中 导入了cats.serivce,并且 在构造函数中 声明了一个依赖于CatsService的对象，该对象通过手动导入，并在运行时会由IoC容器进行实例化，因为前者在Module装饰器中将该对象作为提供者给到IoC容器了，那么运行时就可以交给容器实例化。**

**Nest IoC容器会将根模块中导入的模块扫描并注册，所以你会发现要实例化的模块都会在app.module中通过imports的方式导入，得到模块对应的提供者和控制器**

### Standard Provider

**通常Module装饰器参数中，providers的值总是一个数组，并且提供了多个对象，需要注意的是通常使用的是简写语法，完整的语法应该是这样**

```typescript
@Module({
  controllers: [CatsController],
  providers: [CatsService], // 简写对象
})
// 完整语法
providers: [
  {
    provide: CatsService,
    useClass: CatsService,
  },
];
// 情景策略对象
providers: [
  {
    provide: CatsService,
    useClass: process.env.NODE_ENV === 'development' ? 
      DevelopmentConfigService : ProductionConfigService,
  },
];
```

**通过provide和useClass，将提供者和实际的对象关联起来，我们在模块注入时，会根据提供者查找关联对象并实例化缓存**

### Custom Value Provider

**你也可以通过useValue参数自定义提供者的值,这里提供者仍然是对象标记，来提供任何兼容接口的实际值**

```typescript
const CustomCats = {
  // anything
}
providers: [
  {
    provide: CatsService,
    useValue: CustomCats,
  },
];
```

### Non Class Provider

**当然还可以使用非类作为提供者的标记, 也可以理解用使用令牌作为提供者**

```typescript
providers: [
  {
    provide: 'CONNECTION',
    useValue: CatsService
  },
];
```

**在这种情况下提供的令牌在注入时，需要使用Inject装饰器，显式的声明令牌**

```typescript
@Injectable()
export class CatsRepository {
  @Inject('CONNECTION')
  private connection: Connection
  // 或者
  constructor(@Inject('CONNECTION') connection: Connection) {}
}
```

### Injection Methon

**在前面我们见到过构造函数属性注入，以及装饰器注入，需要注意两者的区分，前者的写法是因为直接使用了标准的提供者写法让IoC容器进行实例注册， 而后者装饰器通常都是出现在第三方模块以及通过令牌的方式自定义了提供者，而非Nestjs的IoC容器管理**

```typescript
export class CatsController {
  // 第一种方式
  @Inject('CONNCTION')
  private connection: Connection
  // 第二种方式
  constructor(private readonly catsService: CatsService) {}
  // 当然你可以统一在构造属性进行实例化
  constructor(
    private readonly catsService: CatsService,
    @Inject('CONNCTION') private connection: Connection
  ) {}
}
```

### UseFactory Provider

**提供者还可以使用工厂函数注册，函数需要返回实际的提供者对象，工厂函数可以接受参数，并且还允许声明一个** `inject`属性，值为提供者数组，Nest会解析这个数组并把它按照顺序作为参数传递给工厂函数消费

```typescript
const connectionFactory = {
  provide: 'CONNECTION',
  useFactory: (optionsProvider: OptionsProvider) => {
    const options = optionsProvider.get();
    return new DatabaseConnection(options);
  },
  inject: [OptionsProvider],
};

@Module({
  providers: [connectionFactory],
})
// 等同于
@Module({
  providers: [{
    provide: 'CONNECTION',
    useFactory: (optionsProvider: OptionsProvider) => {
      const options = optionsProvider.get();
      return new DatabaseConnection(options);
    },
    inject: [OptionsProvider] // 与工厂函数参数类型一致并被消费
  }],
})
export class AppModule {}
```

### Existing Provider

**可以通过别名形式注册类提供者的方式变为令牌注册**

```typescript
@Injectable()
class LoggerService {
  /* implementation details */
}

const loggerAliasProvider = {
  provide: 'AliasedLoggerService',
  useExisting: LoggerService,
};

@Module({
  providers: [LoggerService, loggerAliasProvider],
})
export class AppModule {}
```

### Custom Export Provider

**提供者的作用域仅限于模块， 如果我们希望自定义模块的导出或者被其他模块消费，则需要用到Module装饰器的exports参数**

```typescript
const connectionFactory = {
  provide: 'CONNECTION',
  useFactory: (optionsProvider: OptionsProvider) => {
    const options = optionsProvider.get();
    return new DatabaseConnection(options);
  },
  inject: [OptionsProvider],
};

@Module({
  providers: [connectionFactory],
  exports: ['CONNECTION'], // 通过令牌导出，同时模块的提供者需要包含令牌对应的提供者
})
export class AppModule {}
```

```typescript
const connectionFactory = {
  provide: 'CONNECTION',
  useFactory: (optionsProvider: OptionsProvider) => {
    const options = optionsProvider.get();
    return new DatabaseConnection(options);
  },
  inject: [OptionsProvider],
};

@Module({
  providers: [connectionFactory],
  exports: [connectionFactory],
})
export class AppModule {}
```

### Async Provider

**异步提供通过工厂函数实现，将函数的返回类型变为Promise，其他方式就与工厂函数一致，在依赖注入实例化之前，会等待Promise状态改变**

```typescript
{
  provide: 'ASYNC_CONNECTION',
  useFactory: async () => {
    const connection = await createConnection(options);
    return connection;
  },
}

//实际使用时
@Inject('ASYNC_CONNECTION')
private connection:ASYNC_CONNECTION
```

## Dynamics Module

**当我们需要模块被另外一个模块消费使用时，我们需要通过模块的装饰器exports导出它的提供者，并在另一模块的装饰器中imports导入，这是一种静态的模块导入过程不会受到任何影响，而动态模块则不同，它通过在模块中导出了对应的方法，交给用户决定模块的行为：**

### 动态模块的约定

**对于 register的命名是不固定，但官方推荐了这三种命名和用途**

1. **register  用一次模块传一次配置，比如这次是** `BbbModule.register({ a: 1, b: 2 })`下次是 `BbbModule.register({ a: 1, c: 2 })`
2. **forRoot 配置一次模块使用多次，比如** `BbbModule.forRoot({})`之后 就一直用这个Module， 一般都是在AppModule里import
3. **forFeature 用了forRoot固定整体模块， 在局部的时候可能还需要传递某些配置，比如forRoot 指定了数据库链接信息，再用forFeature 指定某个模块访问哪些库和表**

```typescript
import { DynamicModule, Module } from '@nestjs/common';
import { ConfigService } from './config.service';

@Module({})
export class ConfigModule {
  static register(): DynamicModule {
    return {
      module: ConfigModule,  //通常与导出模块一致，代表这个模块的名称
      providers: [ConfigService], 
      exports: [ConfigService],
    };
  }
}
```

**动态模块的返回值是由Nestjs约定的DynamicModule类，它们都会提供module属性代表其模块以及providers，exports，使其符合Nest模块的标准**

### 示例

**这里需要注意的是，在ConfigService中是可以消费 另外一个提供者的，因为它们都在一个模块中被提供，由模块自身管理和导出，而CONFIG_OPTIONS这个自定义的令牌提供者又会在运行时由用户传递它实际的参数**

```typescript
import { DynamicModule, Module } from '@nestjs/common';
import { ConfigService } from './config.service';

@Module({})
export class ConfigModule {
  static register(options): DynamicModule {
    return {
      module: ConfigModule,
      providers: [
        {
          provide: 'CONFIG_OPTIONS',
          useValue: options,
        },
        ConfigService,
      ],
      exports: [ConfigService],
    };
  }
}
```

**随后，我们在提供者中使用装饰器在运行时得到模块下另外一个由用户传递给提供者的实际值并消费**

```typescript
import { Injectable, Inject } from '@nestjs/common';

import * as dotenv from 'dotenv';
import * as fs from 'fs';

import { EnvConfig } from './interfaces';

// 将令牌交给单独文件作为常量保存管理是最佳实践
// export const CONFIG_OPTIONS = 'CONFIG_OPTIONS';
import { CONFIG_OPTIONS } from './interfaces'
@Injectable()
  
export class ConfigService {
  private readonly envConfig: EnvConfig;

  constructor(@Inject(CONFIG_OPTIONS) private options) {
    const filePath = `${process.env.NODE_ENV || 'development'}.env`;
    const envFile = path.resolve(__dirname, '../../', options.folder, filePath);
    this.envConfig = dotenv.parse(fs.readFileSync(envFile));
  }

  get(key: string): string {
    return this.envConfig[key];
  }
}
```

## Application Context

**Nest提供了 ArgumentsHost和ExecutionContext 两个类，它们可以作用于 守卫、过滤器、拦截器、控制器、方法中**

### ArgumentsHost

**允许选择合适的上下文并进行切换，框架提供了对应的实例 来作为 守卫、过滤器、拦截器等地方的 host参数使用。**

### 切换上下文

**在HTTP应用中，通过nestjs/platform-express， host对象封装了 Express的 request、response、next数组，另外在GraphQL应用中还包含root、args、context、info**

```typescript
if (host.getType() === 'http') {
  // do something that is only important in the context of regular HTTP requests (REST)
} else if (host.getType() === 'rpc') {
  // do something that is only important in the context of Microservice requests
} else if (host.getType<GqlContextType>() === 'graphql') {
  // do something that is only important in the context of GraphQL requests
}
```

```typescript
const [req, res, next] = host.getArgs();
const request = host.getArgByIndex(0);
const response = host.getArgByIndex(1);
```

**并且还提供了切换上下文以及对应类型的函数，用于决定上下文**

```typescript
/**
 * Switch context to RPC.
 */
switchToRpc(): RpcArgumentsHost;
/**
 * Switch context to HTTP.
 */
switchToHttp(): HttpArgumentsHost;
/**
 * Switch context to WebSockets.
 */
switchToWs(): WsArgumentsHost;
// 不同的上下文会提供不同的方法
const ctx = host.switchToHttp();
const request = ctx.getRequest<Request>();
const response = ctx.getResponse<Response>();
```

### 执行上下文

**Nest还提供了ExecutionContext这个类型，它继承了ArgumentsHost，并提供获取方法和类本身的方法**

**最重要的一点是获取到对应的方法和类后，就可以通过反射拿到对应的元数据，也就可以配合装饰器做一些处理**

```typescript
const methodKey = ctx.getHandler().name; // "create"
const className = ctx.getClass().name; // "CatsController"
```

### 示例

**ExecutionContext 继承了ArgumentsHost，提供给守卫使用、拦截器使用**

**它比ArgumentsHost多提供了getHandle、getClass方法获取被装饰器的函数和类**

```typescript
@Injectable()
export class LoginGuard implements CanActivate {
  canActivate(
    context: ExecutionContext, 
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request:Request = context.switchToHttp().getRequest()
  }
}
```

```typescript
import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';

export class UnLoginException{
  message: string;

  constructor(message?){
    this.message = message;
  }
}

@Catch(UnLoginException)
export class UnloginFilter implements ExceptionFilter {
  catch(exception:UnLoginException, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();

    response.json({
      code:HttpStatus.UNAUTHORIZED,
      message:'fail',
      data:exception.message || '用户未登录'
    }).end()
  }
}
```