import { NgModule } from '@angular/core';
import * as ApiServiceProxies from './service-proxies';

@NgModule({
    providers: [
        ApiServiceProxies.UserServiceProxy,
        ApiServiceProxies.AuthServiceProxy,
        ApiServiceProxies.ExamScheduleServiceProxy,
        ApiServiceProxies.SubjectServiceProxy,
        ApiServiceProxies.AiServiceProxy,

    ],
})
export class ServiceProxyModule { }