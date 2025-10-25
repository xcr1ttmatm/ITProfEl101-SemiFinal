import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 11,
    fontFamily: 'Helvetica',
    backgroundColor: '#ffffff',
  },
  header: {
    marginBottom: 20,
    borderBottom: '2 solid #22d3ee',
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0891b2',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#164e63',
    marginBottom: 3,
  },
  dateText: {
    fontSize: 10,
    color: '#64748b',
    marginTop: 5,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0e7490',
    marginBottom: 10,
    borderBottom: '1 solid #a5f3fc',
    paddingBottom: 5,
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  summaryBox: {
    width: '23%',
    padding: 10,
    backgroundColor: '#f0fdfa',
    borderRadius: 5,
    border: '1 solid #5eead4',
  },
  summaryLabel: {
    fontSize: 9,
    color: '#0f766e',
    marginBottom: 3,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0d9488',
  },
  paragraph: {
    fontSize: 11,
    lineHeight: 1.6,
    color: '#1e293b',
    marginBottom: 10,
    textAlign: 'justify',
  },
  table: {
    display: 'table',
    width: 'auto',
    marginBottom: 15,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: '1 solid #e2e8f0',
  },
  tableHeader: {
    backgroundColor: '#e0f2fe',
    borderBottom: '2 solid #0891b2',
  },
  tableCol: {
    padding: 8,
    fontSize: 10,
  },
  tableColStudent: {
    width: '20%',
  },
  tableColName: {
    width: '25%',
  },
  tableColGrade: {
    width: '11%',
  },
  tableHeaderText: {
    fontWeight: 'bold',
    color: '#0c4a6e',
  },
  listContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  listBox: {
    width: '48%',
    padding: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 5,
    border: '1 solid #cbd5e1',
  },
  passedBox: {
    backgroundColor: '#f0fdf4',
    border: '1 solid #86efac',
  },
  failedBox: {
    backgroundColor: '#fef2f2',
    border: '1 solid #fca5a5',
  },
  listTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  passedTitle: {
    color: '#15803d',
  },
  failedTitle: {
    color: '#b91c1c',
  },
  listItem: {
    fontSize: 10,
    color: '#334155',
    marginBottom: 4,
    paddingLeft: 10,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 9,
    color: '#94a3b8',
    borderTop: '1 solid #e2e8f0',
    paddingTop: 10,
  },
  aiLabel: {
    fontSize: 10,
    color: '#7c3aed',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  recommendationBox: {
    backgroundColor: '#fffbeb',
    padding: 12,
    borderRadius: 5,
    border: '1 solid #fde047',
  },
});

const GradeReportDocument = ({ analysisData }) => {
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Grade Analysis Report</Text>
          <Text style={styles.subtitle}>
            {analysisData.subject.code} - {analysisData.subject.name}
          </Text>
          {analysisData.subject.description && (
            <Text style={styles.subtitle}>{analysisData.subject.description}</Text>
          )}
          <Text style={styles.dateText}>Generated on: {currentDate}</Text>
        </View>

        {/* Summary Statistics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Performance Summary</Text>
          <View style={styles.summaryContainer}>
            <View style={styles.summaryBox}>
              <Text style={styles.summaryLabel}>Total Students</Text>
              <Text style={styles.summaryValue}>{analysisData.summary.totalStudents}</Text>
            </View>
            <View style={styles.summaryBox}>
              <Text style={styles.summaryLabel}>Passed</Text>
              <Text style={[styles.summaryValue, { color: '#059669' }]}>
                {analysisData.summary.passed}
              </Text>
            </View>
            <View style={styles.summaryBox}>
              <Text style={styles.summaryLabel}>Failed</Text>
              <Text style={[styles.summaryValue, { color: '#dc2626' }]}>
                {analysisData.summary.failed}
              </Text>
            </View>
            <View style={styles.summaryBox}>
              <Text style={styles.summaryLabel}>Class Average</Text>
              <Text style={styles.summaryValue}>{analysisData.summary.averageGrade}</Text>
            </View>
          </View>
        </View>

        {/* AI Analysis */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>AI-Powered Analysis</Text>
          <Text style={styles.aiLabel}>🤖 Insights & Observations</Text>
          <Text style={styles.paragraph}>{analysisData.analysis}</Text>
        </View>

        {/* Recommendations */}
        {analysisData.recommendations && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recommendations</Text>
            <View style={styles.recommendationBox}>
              <Text style={styles.paragraph}>{analysisData.recommendations}</Text>
            </View>
          </View>
        )}

        {/* Student Lists */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Student Performance Breakdown</Text>
          <View style={styles.listContainer}>
            {/* Passed Students */}
            <View style={[styles.listBox, styles.passedBox]}>
              <Text style={[styles.listTitle, styles.passedTitle]}>
                ✅ Passed Students ({analysisData.passedStudents.length})
              </Text>
              {analysisData.passedStudents.map((name, idx) => (
                <Text key={idx} style={styles.listItem}>
                  • {name}
                </Text>
              ))}
            </View>

            {/* Failed Students */}
            <View style={[styles.listBox, styles.failedBox]}>
              <Text style={[styles.listTitle, styles.failedTitle]}>
                ❌ Failed Students ({analysisData.failedStudents.length})
              </Text>
              {analysisData.failedStudents.map((name, idx) => (
                <Text key={idx} style={styles.listItem}>
                  • {name}
                </Text>
              ))}
            </View>
          </View>
        </View>

        {/* Detailed Grades Table */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Detailed Grade Records</Text>
          <View style={styles.table}>
            {/* Table Header */}
            <View style={[styles.tableRow, styles.tableHeader]}>
              <View style={[styles.tableCol, styles.tableColStudent]}>
                <Text style={styles.tableHeaderText}>Student ID</Text>
              </View>
              <View style={[styles.tableCol, styles.tableColName]}>
                <Text style={styles.tableHeaderText}>Name</Text>
              </View>
              <View style={[styles.tableCol, styles.tableColGrade]}>
                <Text style={styles.tableHeaderText}>Prelim</Text>
              </View>
              <View style={[styles.tableCol, styles.tableColGrade]}>
                <Text style={styles.tableHeaderText}>Midterm</Text>
              </View>
              <View style={[styles.tableCol, styles.tableColGrade]}>
                <Text style={styles.tableHeaderText}>Semifinal</Text>
              </View>
              <View style={[styles.tableCol, styles.tableColGrade]}>
                <Text style={styles.tableHeaderText}>Final</Text>
              </View>
              <View style={[styles.tableCol, styles.tableColGrade]}>
                <Text style={styles.tableHeaderText}>Average</Text>
              </View>
            </View>

            {/* Table Rows */}
            {analysisData.studentsData.map((student, idx) => (
              <View key={idx} style={styles.tableRow}>
                <View style={[styles.tableCol, styles.tableColStudent]}>
                  <Text>{student.studentNumber}</Text>
                </View>
                <View style={[styles.tableCol, styles.tableColName]}>
                  <Text>{student.name}</Text>
                </View>
                <View style={[styles.tableCol, styles.tableColGrade]}>
                  <Text>{student.grades.prelim || '-'}</Text>
                </View>
                <View style={[styles.tableCol, styles.tableColGrade]}>
                  <Text>{student.grades.midterm || '-'}</Text>
                </View>
                <View style={[styles.tableCol, styles.tableColGrade]}>
                  <Text>{student.grades.semifinal || '-'}</Text>
                </View>
                <View style={[styles.tableCol, styles.tableColGrade]}>
                  <Text>{student.grades.final || '-'}</Text>
                </View>
                <View style={[styles.tableCol, styles.tableColGrade]}>
                  <Text style={{ fontWeight: 'bold' }}>
                    {student.average || '-'}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          This report was automatically generated using AI-powered analysis • {currentDate}
        </Text>
      </Page>
    </Document>
  );
};

export default GradeReportDocument;