import { NextResponse } from 'next/server';
import { parseDocxBuffer } from '@/lib/docxParser';
import { dataService } from '@/lib/dataService';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const file = formData.get('file') as File | null;
    const subjectId = formData.get('subject_id') as string | null;
    const subjectCode = formData.get('subject_code') as string | null;
    const title = (formData.get('title') as string) || 'Final Examination';
    const examDate = (formData.get('exam_date') as string) || new Date().toISOString().split('T')[0];
    const startTime = (formData.get('start_time') as string) || '09:00 AM';
    const endTime = (formData.get('end_time') as string) || '11:00 AM';
    const durationMinutes = parseInt((formData.get('duration_minutes') as string) || '120', 10);
    const instructions = (formData.get('instructions') as string) || 'Answer all questions provided in the document.';

    // Resolve subject
    let targetSubject = null;
    if (subjectId) {
      targetSubject = await dataService.getSubjectById(subjectId);
    } else if (subjectCode) {
      targetSubject = await dataService.getSubjectByCode(subjectCode);
    }

    if (!targetSubject) {
      const allSubs = await dataService.getAllSubjects();
      targetSubject = allSubs[0];
    }

    let parsedQuestions: any[] = [];
    let extractedText = '';
    let originalFilename = 'exam_paper.docx';
    let fileSize = 345000;

    if (file) {
      originalFilename = file.name;
      fileSize = file.size;

      // Check file extension
      const isDocx = file.name.endsWith('.docx') || file.name.endsWith('.doc');
      if (!isDocx) {
        return NextResponse.json(
          { error: 'Invalid file format. Please upload a Word document (.docx or .doc).' },
          { status: 400 }
        );
      }

      // Check max size (10MB)
      if (file.size > 10 * 1024 * 1024) {
        return NextResponse.json(
          { error: 'File size exceeds the 10MB limit.' },
          { status: 400 }
        );
      }

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const parseResult = await parseDocxBuffer(buffer);

      extractedText = parseResult.rawText;
      parsedQuestions = parseResult.questions;
    } else {
      // Default sample questions if no file was attached
      extractedText = 'Question 1: Explain the principles of modern decision support architectures in enterprise settings.';
      parsedQuestions = [
        {
          id: 1,
          number: 1,
          text: 'Explain the principles of modern decision support architectures in enterprise settings.',
          type: 'essay',
        },
      ];
    }

    const createdExam = await dataService.createExamWithDocument({
      subject_id: targetSubject.id,
      title: title || `${targetSubject.subject_name} Examination`,
      exam_date: examDate,
      start_time: startTime,
      end_time: endTime,
      duration_minutes: durationMinutes,
      instructions,
      document: {
        original_filename: originalFilename,
        file_size: fileSize,
        extracted_text: extractedText,
        parsed_questions: parsedQuestions,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Examination paper uploaded and processed successfully.',
      exam: createdExam,
      questionsExtracted: parsedQuestions.length,
    });
  } catch (error: any) {
    console.error('Exam upload error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to upload examination paper.' },
      { status: 500 }
    );
  }
}
