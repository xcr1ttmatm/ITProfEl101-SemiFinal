import { GoogleGenerativeAI } from "@google/generative-ai";
import supabase from "./supabase";

const genAI = new GoogleGenerativeAI("AIzaSyD38HRext34CJUuaA2F1SdqK36FNf6BXrY");

export async function studentAnalyzer(subjectId) {
  try {
    // Fetch subject details
    const { data: subject, error: subjectError } = await supabase
      .from('subjects')
      .select('*')
      .eq('id', subjectId)
      .single();

    if (subjectError) throw subjectError;

    // Fetch all students
    const { data: students, error: studentsError } = await supabase
      .from('students')
      .select('*')
      .order('last_name', { ascending: true });

    if (studentsError) throw studentsError;

    // Fetch grades for this subject
    const { data: grades, error: gradesError } = await supabase
      .from('grades')
      .select('*')
      .eq('subject_id', subjectId);

    if (gradesError) throw gradesError;

    // Prepare data for AI
    const studentsWithGrades = students.map(student => {
      const gradeRecord = grades.find(g => g.student_id === student.id);
      
      const gradeValues = gradeRecord ? [
        gradeRecord.prelim,
        gradeRecord.midterm,
        gradeRecord.semifinal,
        gradeRecord.final
      ].filter(g => g !== null && g !== undefined) : [];

      const average = gradeValues.length > 0
        ? (gradeValues.reduce((sum, g) => sum + g, 0) / gradeValues.length).toFixed(2)
        : null;

      return {
        id: student.id,
        studentNumber: student.student_number,
        name: `${student.first_name} ${student.last_name}`,
        grades: {
          prelim: gradeRecord?.prelim || null,
          midterm: gradeRecord?.midterm || null,
          semifinal: gradeRecord?.semifinal || null,
          final: gradeRecord?.final || null
        },
        average: average ? parseFloat(average) : null
      };
    });

    // Calculate summary locally
    const studentsWithAverages = studentsWithGrades.filter(s => s.average !== null);
    const passed = studentsWithAverages.filter(s => s.average < 3.0);
    const failed = studentsWithAverages.filter(s => s.average >= 3.0);
    const totalAverage = studentsWithAverages.length > 0
      ? (studentsWithAverages.reduce((sum, s) => sum + s.average, 0) / studentsWithAverages.length).toFixed(2)
      : '0.00';

    const dataForAI = {
      subject: {
        code: subject.subject_code,
        name: subject.subject_name,
        description: subject.description
      },
      students: studentsWithGrades,
      passingThreshold: 3.0
    };

    // Use gemini-2.0-flash (confirmed working with your API key)
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-exp",
      generationConfig: {
        temperature: 0.7,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 2048,
      },
    });

    // System instruction as part of the prompt
    const systemInstruction = `You are an AI student performance analyzer.
You will receive data including students, their grades, and subject details.

You must respond in **strict JSON** format (no markdown, no code blocks, just pure JSON):

{
  "analysis": "Detailed analysis of student performance, trends, and observations (3-5 sentences)",
  "recommendations": "Actionable recommendations for improving student outcomes (3-5 sentences)"
}

Rules:
- The grading system: lower is better. Passing threshold is < 3.0
- Students with average >= 3.0 have failed
- Use logical, evidence-based reasoning in your analysis
- Provide specific, actionable recommendations
- Be concise but insightful
- ONLY return the JSON object, nothing else`;

    // Generate AI analysis
    const prompt = `${systemInstruction}

Analyze the following student performance data:

${JSON.stringify(dataForAI, null, 2)}

Provide insights on:
1. Overall class performance
2. Trends across grading periods
3. Struggling students
4. Recommendations for improvement

Return ONLY the JSON object, no other text.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();
    
    // Clean up the response text
    text = text.trim();
    if (text.startsWith('```json')) {
      text = text.replace(/```json\n?/g, '').replace(/```\n?$/g, '');
    } else if (text.startsWith('```')) {
      text = text.replace(/```\n?/g, '');
    }
    text = text.trim();
    
    // Parse the JSON response
    let analysisResult;
    try {
      analysisResult = JSON.parse(text);
    } catch (parseError) {
      console.error('Failed to parse AI response:', text);
      throw new Error('AI returned invalid JSON format');
    }

    // Return structured data
    return {
      success: true,
      subject: {
        code: subject.subject_code,
        name: subject.subject_name,
        description: subject.description
      },
      summary: {
        totalStudents: studentsWithAverages.length,
        passed: passed.length,
        failed: failed.length,
        averageGrade: totalAverage
      },
      analysis: analysisResult.analysis,
      recommendations: analysisResult.recommendations,
      passedStudents: passed.map(s => s.name),
      failedStudents: failed.map(s => s.name),
      studentsData: studentsWithGrades
    };

  } catch (error) {
    console.error('Error in studentAnalyzer:', error);
    return {
      success: false,
      error: error.message
    };
  }
}