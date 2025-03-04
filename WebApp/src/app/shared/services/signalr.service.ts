import { Injectable } from '@angular/core';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { BehaviorSubject, Observable } from 'rxjs';
import { getRemoteServiceBaseUrl } from '../../app.config';

@Injectable({
    providedIn: 'root'
})
export class SignalRService {
    private hubConnection!: HubConnection;
    private messageSubject = new BehaviorSubject<string>('');
    private retryCount = 0;
    private maxRetries = 3;
    private retryDelay = 2000;

    public message$ = this.messageSubject.asObservable();

    public async initializeConnection(): Promise<void> {
        if (this.hubConnection) {
            return;
        }

        const baseUrl = getRemoteServiceBaseUrl();
        this.hubConnection = new HubConnectionBuilder()
            .withUrl(`${baseUrl}/chatHub`)
            .withAutomaticReconnect({
                nextRetryDelayInMilliseconds: retryContext => {
                    if (retryContext.previousRetryCount >= this.maxRetries) {
                        return null;
                    }
                    return this.retryDelay;
                }
            })
            .build();

        this.setupSignalRHandlers();
        await this.connectToSignalR();
    }

    public get connectionId(): string | null {
        return this.hubConnection?.connectionId ?? null;
    }

    public get isConnected(): boolean {
        return this.hubConnection?.state === 'Connected';
    }

    private setupSignalRHandlers(): void {
        this.hubConnection.on('ReceiveStreamMessage', (message: string) => {
            this.messageSubject.next(message);
        });

        this.hubConnection.onreconnecting(() => {
            console.log('Attempting to reconnect to SignalR...');
        });

        this.hubConnection.onreconnected(() => {
            console.log('Reconnected to SignalR');
            if (this.hubConnection.connectionId) {
                this.startStreaming();
            }
        });

        this.hubConnection.onclose(() => {
            console.log('SignalR connection closed');
        });
    }

    private async connectToSignalR(): Promise<void> {
        try {
            await this.hubConnection.start();
            console.log('SignalR Connected');
            if (this.hubConnection.connectionId) {
                await this.startStreaming();
            }
        } catch (err) {
            console.error('Error while establishing SignalR connection:', err);
            if (this.retryCount < this.maxRetries) {
                this.retryCount++;
                setTimeout(() => this.connectToSignalR(), this.retryDelay);
            }
        }
    }

    public async startStreaming(): Promise<void> {
        if (this.hubConnection?.connectionId) {
            await this.hubConnection.invoke('StartStreaming', this.hubConnection.connectionId);
        }
    }

    public async stopStreaming(): Promise<void> {
        if (this.hubConnection?.connectionId) {
            await this.hubConnection.invoke('StopStreaming', this.hubConnection.connectionId);
        }
    }

    public async disconnect(): Promise<void> {
        if (this.hubConnection) {
            try {
                await this.stopStreaming();
                await this.hubConnection.stop();
                this.messageSubject.next('');
            } catch (err) {
                console.error('Error stopping SignalR connection:', err);
            }
        }
    }
} 