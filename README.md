# ExamEase - AI-Powered Exam Preparation Platform

ExamEase is an intelligent exam preparation platform that helps students create personalized study schedules, manage learning materials, and get AI-assisted learning support.

## Features

### 1. Exam Schedule Management

- Create and manage exam schedules with detailed information
- Add multiple subjects with topics/chapters for each exam
- Set daily study hours and exam dates
- View exam schedules in both list and calendar formats

### 2. AI-Generated Study Plans

- Automatically generates personalized study plans based on:
  - Available study hours per day
  - Exam dates
  - Subject priorities
  - Topic distribution
- Smart allocation of study time for each subject
- Dynamic adjustment of plans as exam dates approach

### 3. Subject Management

- Create and organize subjects
- Upload and store PDF study materials
- Manage topics and chapters efficiently

### 4. AI Study Assistant

- Interactive chat interface for subject-specific queries
- Context-aware responses based on uploaded study materials
- Real-time learning support
- Smart topic suggestions and clarifications
- Powered by ChatGPT and Kernel Memory for enhanced context understanding

## Technical Stack

### Frontend (Angular)

- Angular 19.1.3
- Material Design components
- Responsive design with Tailwind CSS
- TypeScript for type-safe development

### Backend (.NET Core)

- ASP.NET Core Web API
- Entity Framework Core for data management
- SQL Server database
- AI integration for study plan generation
- Kernel Memory for document processing and context management
- ChatGPT integration for intelligent responses

### Key Components

#### Exam Schedule Module

- `ExamScheduleComponent`: Manages exam schedule creation and updates
- `StudyPlanComponent`: Handles AI-generated study plans
- Calendar and list views for schedule visualization

#### Subject Management

- `SubjectViewComponent`: Handles subject details and materials
- PDF document management
- Chat interface for AI assistance

#### AI Services

- Study plan generation
- Document processing with Kernel Memory
- Chat completion services powered by ChatGPT
- Memory management for context retention

## Getting Started

### Prerequisites

- Node.js and npm
- .NET Core SDK
- SQL Server
- Angular CLI

### Installation

1. Clone the repository

```
bash
git clone [repository-url]
```

2. Frontend Setup

```
bash
cd WebApp
npm install
ng serve
```

3. Backend Setup

```
bash
cd WebApi
dotnet restore
dotnet run
```

4. Database Setup
```
bash
dotnet ef database update
```

## Usage

1. **Create Exam Schedule**

   - Navigate to the exam schedule section
   - Add exam details, subjects, and topics
   - Set study hours and exam dates
   - Submit to generate study plan

2. **View Study Plan**

   - Access generated study plans in calendar or list view
   - Track daily study tasks
   - Monitor progress for each subject

3. **Manage Subjects**
   - Create subjects and upload study materials
   - Use AI chat for subject-specific queries
   - Organize topics and materials

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details

## Acknowledgments

- Built during [Hack The Future] Hackathon
- Powered by AI technology for intelligent study planning
- Community contributions and feedback
