import mammoth from 'mammoth';
import { ParsedQuestion } from './supabase/types';

export interface ParseDocxResult {
  rawText: string;
  htmlContent: string;
  questions: ParsedQuestion[];
}

export async function parseDocxBuffer(buffer: Buffer): Promise<ParseDocxResult> {
  try {
    const rawResult = await mammoth.extractRawText({ buffer });
    const rawText = rawResult.value || '';

    const htmlResult = await mammoth.convertToHtml({ buffer });
    const htmlContent = htmlResult.value || '';

    const questions: ParsedQuestion[] = [];

    // Parse question blocks using Regex
    // Matches: "Question 1", "Question 1:", "Q1.", "1.", "1)", etc.
    const questionRegex = /(?:^|\n+)(?:Question\s*(\d+)[:.]?|Q(\d+)[:.]?|(\d+)[.)])\s*([\s\S]*?)(?=(?:\n+(?:Question\s*\d+[:.]?|Q\d+[:.]?|\d+[.)]))|$)/gi;

    let match;
    let index = 1;

    while ((match = questionRegex.exec(rawText)) !== null) {
      const qNum = parseInt(match[1] || match[2] || match[3] || String(index), 10);
      const textBlock = (match[4] || '').trim();

      if (textBlock.length > 5) {
        // Check for multiple-choice options (A., B., C., D.)
        const optionRegex = /([A-D])[.)]\s*([^\n]+)/g;
        const options: string[] = [];
        let optMatch;
        while ((optMatch = optionRegex.exec(textBlock)) !== null) {
          options.push(`${optMatch[1]}. ${optMatch[2].trim()}`);
        }

        questions.push({
          id: index,
          number: qNum || index,
          text: textBlock,
          type: options.length >= 2 ? 'mcq' : 'essay',
          options: options.length >= 2 ? options : undefined,
        });

        index++;
      }
    }

    // Fallback if structured questions weren't matched: create default questions from paragraphs
    if (questions.length === 0 && rawText.trim().length > 0) {
      const paragraphs = rawText
        .split(/\n\s*\n/)
        .map((p) => p.trim())
        .filter((p) => p.length > 20);

      paragraphs.forEach((p, idx) => {
        questions.push({
          id: idx + 1,
          number: idx + 1,
          text: p,
          type: 'essay',
        });
      });
    }

    return {
      rawText,
      htmlContent,
      questions,
    };
  } catch (error) {
    console.error('Error parsing DOCX:', error);
    return {
      rawText: 'Document uploaded. Text extraction encountered an issue.',
      htmlContent: '<p>Document uploaded. Please view the attached document directly.</p>',
      questions: [
        {
          id: 1,
          number: 1,
          text: 'Please refer to the uploaded examination document to view and complete the questions.',
          type: 'essay',
        },
      ],
    };
  }
}
