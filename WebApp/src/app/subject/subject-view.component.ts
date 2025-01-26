import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SubjectServiceProxy, AiServiceProxy } from '../../service-proxies/service-proxies';
import { getRemoteServiceBaseUrl } from '../app.config';
import { finalize } from 'rxjs/operators';
import { SafePipe } from '../shared/pipes/safe.pipe';

@Component({
    selector: 'app-subject-view',
    templateUrl: './subject-view.component.html',
    standalone: true,
    imports: [CommonModule, RouterModule, ReactiveFormsModule, SafePipe],
    providers: [SubjectServiceProxy, AiServiceProxy],
    styles: [`
        .typing-indicator {
            display: flex;
            gap: 4px;
        }
        
        .typing-indicator span {
            width: 8px;
            height: 8px;
            background-color: #3B82F6;
            border-radius: 50%;
            animation: bounce 1.4s infinite ease-in-out;
        }
        
        .typing-indicator span:nth-child(1) { animation-delay: -0.32s; }
        .typing-indicator span:nth-child(2) { animation-delay: -0.16s; }
        
        @keyframes bounce {
            0%, 80%, 100% { transform: scale(0); }
            40% { transform: scale(1); }
        }

        .chat-container {
            height: 100%;
            display: flex;
            flex-direction: column;
        }

        .messages-container {
            flex: 1;
            overflow-y: auto;
            scrollbar-width: thin;
            scrollbar-color: #E5E7EB transparent;
        }

        .messages-container::-webkit-scrollbar {
            width: 6px;
        }

        .messages-container::-webkit-scrollbar-track {
            background: transparent;
        }

        .messages-container::-webkit-scrollbar-thumb {
            background-color: #E5E7EB;
            border-radius: 3px;
        }
    `]
})
export class SubjectViewComponent implements OnInit {
    subjectId!: number;
    subject: any;
    isLoading = false;
    selectedFile: string | null = null;
    chatForm: FormGroup;
    messages: { text: string; isUser: boolean }[] = [];
    isSendingMessage = false;
    isChatVisible = true;
    @ViewChild('messageContainer') private messageContainer!: ElementRef;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private subjectService: SubjectServiceProxy,
        private aiService: AiServiceProxy,
        private fb: FormBuilder
    ) {
        this.chatForm = this.fb.group({
            message: ['', Validators.required]
        });
    }

    ngOnInit(): void {
        this.subjectId = +this.route.snapshot.params['id'];
        this.loadSubject();
    }

    loadSubject(): void {
        this.isLoading = true;
        this.subjectService.getSubjectById(this.subjectId)
            .pipe(finalize(() => this.isLoading = false))
            .subscribe(
                (result) => {
                    this.subject = result;
                },
                (error) => {
                    console.error('Error loading subject:', error);
                }
            );
    }

    getFileUrl(fileName: string): string {
        const baseUrl = getRemoteServiceBaseUrl();
        return `${baseUrl}/static/subject/${fileName}`;
    }

    selectFile(fileName: string): void {
        this.selectedFile = fileName === this.selectedFile ? null : fileName;
    }

    private scrollToBottom(): void {
        try {
            const container = this.messageContainer.nativeElement;
            container.scrollTop = container.scrollHeight;
        } catch (err) { }
    }

    async sendMessage(): Promise<void> {
        if (this.chatForm.valid && this.subject?.name) {
            const message = this.chatForm.get('message')?.value;
            this.messages.push({ text: message, isUser: true });
            this.scrollToBottom();
            this.chatForm.reset();

            this.isSendingMessage = true;
            try {
                const response = await this.aiService.askQuestion(message, this.subject.name)
                    .pipe(finalize(() => this.isSendingMessage = false))
                    .toPromise();

                if (response && response.message) {
                    this.messages.push({ text: response.message, isUser: false });
                    this.scrollToBottom();
                }
            } catch (error) {
                console.error('Error sending message:', error);
                this.messages.push({
                    text: 'Sorry, I encountered an error processing your request.',
                    isUser: false
                });
            }
        }
    }

    toggleChatView(): void {
        this.isChatVisible = !this.isChatVisible;
    }
} 