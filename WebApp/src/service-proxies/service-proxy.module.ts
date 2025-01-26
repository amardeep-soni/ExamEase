import { NgModule } from '@angular/core';
import * as ApiServiceProxies from './service-proxies';

@NgModule({
    providers: [
        ApiServiceProxies.UserServiceProxy,
        ApiServiceProxies.AuthServiceProxy,
        ApiServiceProxies.ExamScheduleServiceProxy,

    ],
})
export class ServiceProxyModule { }