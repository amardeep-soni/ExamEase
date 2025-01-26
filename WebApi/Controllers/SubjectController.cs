using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using WebApi.Dtos;
using WebApi.IRepositories;
using WebApi.Services;

namespace WebApi.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class SubjectController : ControllerBase
    {
        private readonly ISubjectRepository _subjectService;
        private readonly IUserContextService _userContextService;

        public SubjectController(
            ISubjectRepository subjectService,
            IUserContextService userContextService)
        {
            _subjectService = subjectService;
            _userContextService = userContextService;
        }

        [HttpGet("GetAllSubject")]
        public async Task<ActionResult<List<Subject>>> GetAllSubject()
        {
            var userEmail = _userContextService.GetUserEmail();
            var subjects = await _subjectService.GetAllAsync(userEmail);
            return Ok(subjects);
        }

        [HttpGet("GetSubjectById/{id}")]
        public async Task<ActionResult<Subject>> GetSubjectById(int id)
        {
            var userEmail = _userContextService.GetUserEmail();
            var subject = await _subjectService.GetByIdAsync(id, userEmail);
            if (subject == null) return NotFound();
            return Ok(subject);
        }

        [HttpPost("Create")]
        public async Task<ActionResult<Subject>> Create(subjectRequest request)
        {
            var userEmail = _userContextService.GetUserEmail();
            var subject = await _subjectService.CreateAsync(request, userEmail);
            return Ok(subject);
        }

        [HttpPut("Update/{id}")]
        public async Task<ActionResult<Subject>> Update(int id, subjectRequest request)
        {
            var userEmail = _userContextService.GetUserEmail();
            var subject = await _subjectService.UpdateAsync(id, request, userEmail);
            if (subject == null) return NotFound();
            return Ok(subject);
        }

        [HttpDelete("Delete/{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var userEmail = _userContextService.GetUserEmail();
            await _subjectService.DeleteAsync(id, userEmail);
            return NoContent();
        }
    }
} 