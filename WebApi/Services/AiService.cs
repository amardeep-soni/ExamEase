using System;
using System.Security.Claims;
using Microsoft.KernelMemory;
using Microsoft.SemanticKernel;
using Microsoft.SemanticKernel.ChatCompletion;
using WebApi.Dtos;
using System.IO;
using NetTopologySuite.Utilities;
using Microsoft.Identity.Client;
using DocumentFormat.OpenXml.Spreadsheet;

namespace WebApi.Services
{
    public class AIService
    {
        private readonly Kernel _kernel;
        private readonly IKernelMemory _memory;
        private readonly IChatCompletionService _chatCompletionService;
        private readonly IUserContextService _userContextService;

        public AIService(
            Kernel kernel,
            IKernelMemory memory,
            IChatCompletionService chatCompletionService,
            IUserContextService userContextService)
        {
            _kernel = kernel;
            _memory = memory;
            _chatCompletionService = chatCompletionService;
            _userContextService = userContextService;
        }

        public async Task<string> GetAiAnswer(string question)
        {
            var searchResult = await _memory.SearchAsync(question, index: "default", minRelevance: 0.4, limit: 1);
            if (searchResult.NoResult == false)
            {
                var found = searchResult.Results[0].Partitions.FirstOrDefault();
                var documentId = searchResult.Results[0].DocumentId;
                return found.Text + '~' + documentId;
            }
            return "No relevant answer found.";
        }

        public async Task AddDataToMemory(string data, string documentId)
        {
            await _memory.ImportTextAsync(data, documentId, index: "default");
        }

        public async Task DeleteDataFromMemory(string documentId)
        {
            await _memory.DeleteDocumentAsync(documentId, index: "default");
        }

        public async Task<List<StudyPlanRequest>> GenerateStudyPlanTask(ExamScheduleRequest examScheduleRequest)
        {
            var chatHistory = new ChatHistory();
            chatHistory.AddSystemMessage(@"You are an AI assistant that helps generate study plans based on the provided exam schedule. 
                Your response should be a plain JSON array without any markdown formatting, escape characters, or newlines, following this structure:
                [{""date"": ""yyyy-MM-dd"", ""tasks"": [{""subject"": ""[subject name]"",""topic"": ""[topic name]"",""timeAllocated"": [time in minutes]}]}]");
            chatHistory.AddSystemMessage(@"Use the provided exam schedule to create a daily study plan until each exam date.
                Allocate study time based on the daily study hours and the time remaining until each exam.
                Consider the following when generating the plan:
                - Create a day-by-day schedule starting from the provided Today date until each exam date
                - Only include study tasks for subjects whose exams haven't happened yet
                - After an exam is completed, remove that subject from future study days
                - Prioritize subjects with earlier exam dates
                - Break down topics into manageable chunks
                - Account for the daily study hours constraint
                - Total time allocated per day should not exceed daily study hours");

            // Create detailed user message with exam schedule
            chatHistory.AddUserMessage(
                $"Please generate a daily study plan based on the following schedule:\n\n" +
                $"Available Study Hours Per Day: {examScheduleRequest.DailyStudyHours}\n" +
                $"Today Date: {DateTime.Now:yyyy-MM-dd}\n" +
                $"Exam Schedule Details:\n" +
                string.Join("\n", examScheduleRequest.ExamSubjectTimes.OrderBy(x => x.ExamDateTime).Select(est =>
                    $"- Subject: {est.Subject}\n" +
                    $"  Topics: {string.Join(", ", est.TopicOrChapter)}\n" +
                    $"  Scheduled For: {est.ExamDateTime:yyyy-MM-dd}"
                ))
            );

            // Get AI response
            var response = await _chatCompletionService.GetChatMessageContentAsync(
                chatHistory: chatHistory,
                kernel: _kernel
            );

            try
            {
                // Clean up the response content
                var content = response.Content
                    .Replace("```json", "")
                    .Replace("```", "")
                    .Replace("\n", "")
                    .Replace("\r", "")
                    .Replace("\\n", "")
                    .Replace("\\r", "")
                    .Replace("\\\"", "\"")
                    .Trim();

                if (content.StartsWith("\"") && content.EndsWith("\""))
                {
                    content = content.Substring(1, content.Length - 2);
                }

                var options = new System.Text.Json.JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                };

                var studyPlan = System.Text.Json.JsonSerializer.Deserialize<List<StudyPlanRequest>>(content, options);

                if (studyPlan == null || !studyPlan.Any() ||
                    studyPlan.Any(x => string.IsNullOrEmpty(x.Date) ||
                                     x.Tasks == null ||
                                     !x.Tasks.Any() ||
                                     x.Tasks.Any(t => string.IsNullOrEmpty(t.Subject) ||
                                                    string.IsNullOrEmpty(t.Topic) ||
                                                    t.TimeAllocated <= 0)))
                {
                    throw new Exception("Invalid JSON response structure");
                }

                return studyPlan;
            }
            catch (Exception ex)
            {
                // Fallback response if JSON parsing fails
                var now = DateTime.Now;
                var studyPlan = new List<StudyPlanRequest>();
                var orderedExams = examScheduleRequest.ExamSubjectTimes.OrderBy(x => x.ExamDateTime).ToList();

                // Create plan until last exam
                var currentDateTime = now;
                while (currentDateTime <= orderedExams.Last().ExamDateTime)
                {
                    // Get subjects that haven't had their exam yet
                    var activeSubjects = orderedExams.Where(x => x.ExamDateTime > currentDateTime).ToList();

                    if (activeSubjects.Any())
                    {
                        var dailyTasks = new List<StudyTasksDto>();
                        var minutesPerSubject = examScheduleRequest.DailyStudyHours * 60 / activeSubjects.Count;

                        foreach (var subject in activeSubjects)
                        {
                            // Rotate through topics for each subject
                            var topicIndex = (int)((currentDateTime - now).TotalDays) % subject.TopicOrChapter.Count;

                            dailyTasks.Add(new StudyTasksDto
                            {
                                Subject = subject.Subject,
                                Topic = subject.TopicOrChapter[topicIndex],
                                TimeAllocated = minutesPerSubject
                            });
                        }

                        studyPlan.Add(new StudyPlanRequest
                        {
                            Date = currentDateTime.ToString("yyyy-MM-dd"),
                            Tasks = dailyTasks
                        });
                    }

                    currentDateTime = currentDateTime.AddDays(1);
                }

                return studyPlan;
            }
        }

        public async Task AddDocumentToMemory(List<string> filePaths, string subject)
        {
            filePaths.ForEach(async filePath =>
            {
                var fileName = Path.GetFileName(filePath);
                var tag = new TagCollection();
                tag.Add("email", _userContextService.GetUserEmail());
                tag.Add("subject", subject);
                await _memory.ImportDocumentAsync(filePath, fileName, tags: tag);
            });
        }

        //public async Task<string> GetAiAnswerFromIndex(string question)
        //{
        //    var searchResult = await _memory.SearchAsync(
        //        question,
        //        minRelevance: 0.3,
        //        filter: new MemoryFilter().ByTag("email", _userContextService.GetUserEmail())
        //    );
        //    if (searchResult.NoResult == false)
        //    {
        //        var found = searchResult.Results[0].Partitions.FirstOrDefault();
        //        var documentId = searchResult.Results[0].DocumentId;
        //        return found.Text + '~' + documentId;
        //    }
        //    return "No relevant answer found.";
        //}

        public async Task<ResponseMessage> AskQuestionAsync(string question, string subject)
        {
            var res = new ResponseMessage();
            var userEmail = _userContextService.GetUserEmail();
            var memoryAnswer = await _memory.AskAsync(
                question,
                filter: new MemoryFilter().ByTag("email", userEmail).ByTag("subject", subject),
                minRelevance: 0.4
            );

            if (memoryAnswer.NoResult == false)
            {
                res.IsError = "false";
                res.Message = memoryAnswer.Result;
            }
            else
            {
                var searchResult = await _memory.SearchAsync(
                    question,
                    minRelevance: 0.2,
                    filter: new MemoryFilter().ByTag("email", userEmail)
                );

                if (searchResult.NoResult == false)
                {
                    var allTexts = searchResult.Results.SelectMany(r => r.Partitions).Select(p => p.Text).ToList();
                    var combinedText = string.Join(" ", allTexts);

                    var chatHistory = new ChatHistory();
                    chatHistory.AddSystemMessage("You are an AI assistant that helps find the most relevant answer from the provided text. Don't add Extra Text");
                    chatHistory.AddUserMessage($"Question: {question}\n\nText: {combinedText}");

                    var response = await _chatCompletionService.GetChatMessageContentAsync(
                        chatHistory: chatHistory,
                        kernel: _kernel
                    );

                    res.IsError = "false";
                    res.Message = response.Content;
                }
                else
                {
                    res.IsError = "true";
                    res.Message = "No relevant answer found.";
                }
            }

            return res;
        }

        public async Task DeleteDocumentsAsync(List<string> documentIds)
        {

            foreach (var documentId in documentIds)
            {
                await _memory.DeleteDocumentAsync(documentId);
            }
        }
    }
}
