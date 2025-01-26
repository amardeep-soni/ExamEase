import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SubjectRequest, SubjectServiceProxy, AiServiceProxy } from '../../service-proxies/service-proxies';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { HostListener } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { getRemoteServiceBaseUrl } from '../app.config';

export interface FileHandle {
    file: File;
    url: string;
}
@Component({
    selector: 'app-subject-form',
    templateUrl: './subject-form.component.html',
    standalone: true,
    imports: [ReactiveFormsModule, CommonModule, RouterModule],
    providers: [SubjectServiceProxy, AiServiceProxy]
})
export class SubjectFormComponent implements OnInit {
    subjectForm!: FormGroup;
    isEditMode = false;
    subjectId!: number;
    existingFiles: string[] = [];
    newFiles: File[] = [];
    filesToDelete: string[] = [];
    isDragging = false;
    isLoading = false;
    isSaving = false;

    constructor(
        private fb: FormBuilder,
        private subjectService: SubjectServiceProxy,
        private aiService: AiServiceProxy,
        private router: Router,
        private route: ActivatedRoute
    ) {
        this.createForm();
    }

    ngOnInit(): void {
        this.subjectId = +this.route.snapshot.params['id'];
        if (this.subjectId) {
            this.isEditMode = true;
            this.loadSubject();
        }
    }

    createForm(): void {
        this.subjectForm = this.fb.group({
            name: ['', Validators.required],
            description: ['']
        });
    }

    loadSubject(): void {
        this.isLoading = true;
        this.subjectService.getSubjectById(this.subjectId)
            .pipe(finalize(() => this.isLoading = false))
            .subscribe(
                (subject) => {
                    this.subjectForm.patchValue({
                        name: subject.name,
                        description: subject.description
                    });
                    if (subject.fileNames) {
                        this.existingFiles = subject.fileNames.split(',');
                    }
                },
                (error) => {
                    console.error('Error loading subject:', error);
                }
            );
    }

    @HostListener('dragover', ['$event'])
    onDragOver(event: DragEvent): void {
        event.preventDefault();
        event.stopPropagation();
        this.isDragging = true;
    }

    @HostListener('dragleave', ['$event'])
    onDragLeave(event: DragEvent): void {
        event.preventDefault();
        event.stopPropagation();
        this.isDragging = false;
    }

    @HostListener('drop', ['$event'])
    onDrop(event: DragEvent): void {
        event.preventDefault();
        event.stopPropagation();
        this.isDragging = false;

        const files = event.dataTransfer?.files;
        if (files) {
            for (let i = 0; i < files.length; i++) {
                if (files[i].type === 'application/pdf') {
                    this.newFiles.push(files[i]);
                }
            }
        }
    }

    onFileSelected(event: any): void {
        const files: FileList = event.target.files;
        if (files) {
            for (let i = 0; i < files.length; i++) {
                if (files[i].type === 'application/pdf') {
                    this.newFiles.push(files[i]);
                }
            }
        }
    }

    removeExistingFile(fileName: string): void {
        this.existingFiles = this.existingFiles.filter(f => f !== fileName);
        this.filesToDelete.push(fileName);
    }

    removeNewFile(file: File): void {
        this.newFiles = this.newFiles.filter(f => f !== file);
    }

    async onSubmit(): Promise<void> {
        if (this.subjectForm.valid) {
            this.isSaving = true;
            try {
                if (this.filesToDelete.length > 0) {
                    // Handle file deletions
                    await firstValueFrom(this.aiService.deleteDocument(this.filesToDelete));
                }

                // Upload new files
                let uploadedFileNames: string[] = [];
                if (this.newFiles.length > 0) {
                    const response = await firstValueFrom(
                        this.aiService.uploadPdfNotes(
                            this.subjectForm.get('name')?.value,
                            this.newFiles.map(file => ({
                                data: file,
                                fileName: file.name
                            }))
                        )
                    );
                    if (response.message) {
                        uploadedFileNames = response.message.split(',').map(name => name.trim());
                    }
                }

                // Combine existing and new file names
                const allFileNames = [...this.existingFiles, ...uploadedFileNames];

                const request = new SubjectRequest({
                    name: this.subjectForm.get('name')?.value,
                    description: this.subjectForm.get('description')?.value,
                    fileNames: allFileNames
                });

                const action = this.isEditMode
                    ? this.subjectService.update(this.subjectId, request)
                    : this.subjectService.create(request);

                action.subscribe(
                    () => {
                        this.router.navigate(['/subjects']);
                    },
                    (error) => {
                        console.error('Error saving subject:', error);
                    }
                );
            } catch (error) {
                console.error('Error handling files:', error);
            } finally {
                this.isSaving = false;
            }
        }
    }

    openPdf(fileName: string): void {
        const baseUrl = getRemoteServiceBaseUrl();
        window.open(`${baseUrl}/static/subject/${fileName}`, '_blank');
    }
}