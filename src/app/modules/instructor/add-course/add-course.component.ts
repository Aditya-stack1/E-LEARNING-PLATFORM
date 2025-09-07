import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CourseService } from '../../../services/course.service';
import { Course } from '../../../models/course';

@Component({
  selector: 'app-add-course',
  standalone: false,
  templateUrl: './add-course.component.html',
  styleUrls: ['./add-course.component.css']
})
export class AddCourseComponent implements OnInit {
  courseForm!: FormGroup;
  message = '';
  courses: Course[] = [];
  editingCourseId: number | null = null;   // ✅ track editing

  constructor(private fb: FormBuilder, private courseService: CourseService) {}

  ngOnInit(): void {
    this.courseForm = this.fb.group({
      title: ['', Validators.required],
      instructorId: [1001, Validators.required],
      domain: ['', Validators.required],
      level: ['', Validators.required],
      durationHrs: [null],
      tags: [''],
      description: ['']
    });

    this.loadCourses();
  }

  loadCourses() {
    this.courseService.getCourses().subscribe({
      next: (data) => this.courses = data,
      error: (err) => console.error(err)
    });
  }

  onSubmit() {
    if (!this.courseForm.valid) {
      this.message = 'Please fill required fields.';
      return;
    }

    const fv = this.courseForm.value;
    const tagsArray: string[] = fv.tags
      ? fv.tags.split(',').map((t: string) => t.trim()).filter((t: string) => t.length > 0)
      : [];

    const courseData: Course = {
      id: this.editingCourseId ?? Date.now(),   // ✅ use existing id if editing
      title: fv.title,
      instructorId: +fv.instructorId,
      domain: fv.domain,
      level: fv.level,
      durationHrs: fv.durationHrs ? +fv.durationHrs : undefined,
      tags: tagsArray,
      description: fv.description
    };

    if (this.editingCourseId) {
      // ✅ update course
      this.courseService.updateCourse(this.editingCourseId, courseData).subscribe({
        next: () => {
          this.message = '✏️ Course updated successfully';
          this.courseForm.reset();
          this.editingCourseId = null;
          this.loadCourses();
        },
        error: (err) => {
          console.error(err);
          this.message = '❌ Failed to update course';
        }
      });
    } else {
      // ✅ add new course
      this.courseService.addCourse(courseData).subscribe({
        next: () => {
          this.message = '✅ Course added successfully';
          this.courseForm.reset();
          this.loadCourses();
        },
        error: (err) => {
          console.error(err);
          this.message = '❌ Failed to add course';
        }
      });
    }
  }

  // ✅ delete course
  remove(courseId: number) {
    this.courseService.deleteCourse(courseId).subscribe({
      next: () => {
        this.message = '🗑 Course deleted successfully';
        this.loadCourses();
      },
      error: (err) => {
        console.error(err);
        this.message = '❌ Failed to delete course';
      }
    });
  }

  // ✅ edit course
  edit(course: Course) {
    this.editingCourseId = course.id;
    this.courseForm.patchValue({
      title: course.title,
      instructorId: course.instructorId,
      domain: course.domain,
      level: course.level,
      durationHrs: course.durationHrs,
      tags: course.tags?.join(', '),
      description: course.description
    });
  }
}
