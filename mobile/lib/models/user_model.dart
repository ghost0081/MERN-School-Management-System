class UserModel {
  final String id;
  final String name;
  final String email;
  final String role; // 'Student', 'Teacher', 'Parent'
  final String? sclassName;
  final String? sclassId;
  final String? teachSubjectId;
  final String? studentId;
  final String schoolId;

  UserModel({
    required this.id,
    required this.name,
    required this.email,
    required this.role,
    this.sclassName,
    this.sclassId,
    this.teachSubjectId,
    this.studentId,
    required this.schoolId,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    String extractSchool(dynamic school) {
      if (school is Map) return school['_id']?.toString() ?? '';
      return school?.toString() ?? '';
    }

    String? extractClassName(dynamic sclass) {
      if (sclass == null) return null;
      if (sclass is Map) return sclass['sclassName']?.toString();
      return null;
    }

    String? extractClassId(dynamic sclass) {
      if (sclass == null) return null;
      if (sclass is Map) return sclass['_id']?.toString();
      return sclass.toString();
    }

    String? extractSubjectId(dynamic subject) {
      if (subject == null) return null;
      if (subject is Map) return subject['_id']?.toString();
      return subject.toString();
    }

    return UserModel(
      id: json['_id']?.toString() ?? '',
      name: json['name']?.toString() ?? '',
      email: json['email']?.toString() ?? json['rollNum']?.toString() ?? '',
      role: json['role']?.toString() ?? '',
      sclassName: extractClassName(json['sclassName'] ?? json['teachSclass']),
      sclassId: extractClassId(json['sclassName'] ?? json['teachSclass']),
      teachSubjectId: extractSubjectId(json['teachSubject']),
      studentId: extractSubjectId(json['student']), // uses same extraction logic as subject
      schoolId: extractSchool(json['school']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      '_id': id,
      'name': name,
      'email': email,
      'role': role,
      'sclassName': {
        '_id': sclassId,
        'sclassName': sclassName,
      },
      'teachSubject': teachSubjectId,
      'student': studentId,
      'school': schoolId,
    };
  }
}
