import { Controller, Post, Get, Patch, Body, Param, UseGuards, Req } from '@nestjs/common';
import { RequestsService } from './requests.service';
import { CreateRequestDto } from './dto/create-request.dto';
import { JwtGuard } from '../auth/jwt.guard';

@Controller('requests')
@UseGuards(JwtGuard)
export class RequestsController {
    constructor(private requestService :RequestsService){}

    @Post()
    create(@Body() dto:CreateRequestDto , @Req() req:any){
        return this.requestService.create(req['user'].sub,dto);
    }

    @Get()
    findAll(@Req() req :any){
        return this.requestService.findAll(req['user'].sub);
    }
    @Get('active')
    findActive(){
        return this.requestService.findActive();
    }

    @Patch(':id/fulfill')
    fulfill(@Param('id') id:string, @Req() req:any, @Body('donorIds') donorIds?: number[]){
        return this.requestService.fulfill(Number(id), req['user'].sub, donorIds);
    }
}
