import { Controller, Get, Query } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getQueryParams(@Query() queryParams: Record<string, any>) {
    return { receivedQueryParams: queryParams };
  }
}