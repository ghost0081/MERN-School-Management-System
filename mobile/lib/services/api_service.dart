import 'dart:convert';
import 'package:http/http.dart' as http;
import '../config.dart';

class ApiService {
  Future<Map<String, dynamic>> login(String role, String identifier, String password, {String? studentName}) async {
    String endpoint;
    if (role == 'Student') {
      endpoint = Config.studentLogin;
    } else if (role == 'Teacher') {
      endpoint = Config.teacherLogin;
    } else if (role == 'Parent') {
      endpoint = Config.parentLogin;
    } else {
      throw Exception('Invalid role specified');
    }

    try {
      final response = await http.post(
        Uri.parse(endpoint),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          if (role == 'Student' || role == 'Parent') 'rollNum': identifier else 'email': identifier,
          if (role == 'Student' && studentName != null) 'studentName': studentName,
          'password': password,
        }),
      );

      final data = jsonDecode(response.body);

      if (response.statusCode == 200) {
        if (data is Map && data.containsKey('message')) {
          throw Exception(data['message']);
        }
        return data; // Usually returns user object and token
      } else {
        throw Exception(data['message'] ?? 'Login failed');
      }
    } catch (e) {
      throw Exception(e.toString());
    }
  }

  // --- Teacher API Methods ---
  Future<Map<String, dynamic>> getSubjectDetails(String id) async {
    if (id.isEmpty) throw Exception('Invalid ID');
    final response = await _getReq(Config.subjectDetails(id));
    if (response is Map) return response as Map<String, dynamic>;
    throw Exception('Invalid format');
  }

  Future<List<dynamic>> getClassStudents(String id) async {
    if (id.isEmpty) return [];
    final response = await _getReq(Config.classStudents(id));
    if (response is Map && response.containsKey('message')) return [];
    return response as List<dynamic>;
  }

  Future<List<dynamic>> getTeacherTimetable(String id) async {
    if (id.isEmpty) return [];
    final response = await _getReq(Config.teacherTimetable(id));
    if (response is Map && response.containsKey('message')) return [];
    return response as List<dynamic>;
  }

  Future<List<dynamic>> getTeacherAssignments(String id) async {
    if (id.isEmpty) return [];
    final response = await _getReq('${Config.baseUrl}/AssignmentList/teacher/$id');
    if (response is Map && response.containsKey('message')) return [];
    return response as List<dynamic>;
  }

  Future<List<dynamic>> getTeacherLeaves(String id) async {
    if (id.isEmpty) return [];
    final response = await _getReq(Config.teacherLeaves(id));
    if (response is Map && response.containsKey('message')) return [];
    return response as List<dynamic>;
  }

  Future<List<dynamic>> getTeacherPayroll(String id) async {
    if (id.isEmpty) return [];
    final response = await _getReq(Config.teacherPayroll(id));
    if (response is Map && response.containsKey('message')) return [];
    return response as List<dynamic>;
  }

  Future<Map<String, dynamic>> getTeacherProfile(String id) async {
    if (id.isEmpty) throw Exception('Invalid ID');
    final response = await _getReq(Config.teacherProfile(id));
    if (response is Map) return response as Map<String, dynamic>;
    throw Exception('Invalid format');
  }

  Future<dynamic> _getReq(String endpoint) async {
    try {
      final response = await http.get(Uri.parse(endpoint));
      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      }
      throw Exception('Failed to load data');
    } catch (e) {
      throw Exception(e.toString());
    }
  }

  Future<Map<String, dynamic>> getStudentDetails(String id) async {
    if (id.isEmpty) throw Exception('Invalid ID');
    final response = await _getReq(Config.studentDetails(id));
    if (response is Map) return response as Map<String, dynamic>;
    throw Exception('Invalid response format');
  }

  Future<List<dynamic>> getClassSubjects(String classId) async {
    if (classId.isEmpty) return [];
    final response = await _getReq(Config.classSubjects(classId));
    if (response is Map && response.containsKey('message')) return [];
    return response as List<dynamic>;
  }

  Future<List<dynamic>> getStudentAssignments(String id) async {
    if (id.isEmpty) return [];
    final response = await _getReq(Config.studentAssignments(id));
    if (response is Map && response.containsKey('message')) return [];
    return response as List<dynamic>;
  }

  Future<List<dynamic>> getClassTimetable(String classId) async {
    if (classId.isEmpty) return [];
    final response = await _getReq(Config.classTimetable(classId));
    if (response is Map && response.containsKey('message')) return [];
    return response as List<dynamic>;
  }

  Future<List<dynamic>> getComplains(String schoolId) async {
    if (schoolId.isEmpty) return [];
    final response = await _getReq(Config.complainList(schoolId));
    if (response is Map && response.containsKey('message')) return [];
    return response as List<dynamic>;
  }

  Future<List<dynamic>> getStudentFeeHistory(String studentId) async {
    if (studentId.isEmpty) return [];
    final response = await _getReq(Config.studentFeeHistory(studentId));
    if (response is Map && response.containsKey('message')) return [];
    return response as List<dynamic>;
  }

  // --- Tracker API Methods ---
  Future<Map<String, dynamic>> getDeviceData(String deviceId) async {
    if (deviceId.isEmpty) throw Exception('Invalid device ID');
    final response = await _getReq('${Config.baseUrl}/api/admin/$deviceId');
    if (response is Map) return response as Map<String, dynamic>;
    throw Exception('Invalid response format');
  }

  Future<void> createComplain(String user, String date, String complaint, String school) async {
    try {
      final response = await http.post(
        Uri.parse(Config.complainCreate),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'user': user,
          'date': date,
          'complaint': complaint,
          'school': school,
        }),
      );
      if (response.statusCode != 200) {
        throw Exception('Failed to submit complain');
      }
    } catch (e) {
      throw Exception(e.toString());
    }
  }

  // --- Shop / Stationery Methods ---
  Future<List<dynamic>> getStationery(String schoolId) async {
    if (schoolId.isEmpty) return [];
    final response = await _getReq('${Config.baseUrl}/Stationery/$schoolId');
    if (response is Map && response.containsKey('message')) return [];
    return response as List<dynamic>;
  }

  Future<void> createInvoice(Map<String, dynamic> payload) async {
    try {
      final response = await http.post(
        Uri.parse('${Config.baseUrl}/Invoice'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode(payload),
      );
      if (response.statusCode != 200) {
        throw Exception('Failed to create invoice');
      }
    } catch (e) {
      throw Exception(e.toString());
    }
  }
}
