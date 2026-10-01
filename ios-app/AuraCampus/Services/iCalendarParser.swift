import Foundation

public final class iCalendarParser: Sendable {
    public static let shared = iCalendarParser()

    private init() {}

    public func parse(icsContent: String) -> [ScheduleEvent] {
        let unfolded = unfold(icsContent)
        let lines = unfolded.components(separatedBy: .newlines)

        var events: [ScheduleEvent] = []
        var inEvent = false
        var currentFields: [String: String] = [:]

        for line in lines {
            let trimmed = line.trimmingCharacters(in: .whitespacesAndNewlines)
            if trimmed.isEmpty { continue }

            if trimmed == "BEGIN:VEVENT" {
                inEvent = true
                currentFields = [:]
            } else if trimmed == "END:VEVENT" {
                inEvent = false
                if let event = buildEvent(from: currentFields) {
                    events.append(event)
                }
            } else if inEvent {
                if let colonIndex = trimmed.firstIndex(of: ":") {
                    let keyPart = String(trimmed[..<colonIndex])
                    let valuePart = String(trimmed[trimmed.index(after: colonIndex)...])
                    let cleanKey = keyPart.components(separatedBy: ";").first ?? keyPart
                    currentFields[cleanKey.uppercased()] = valuePart
                }
            }
        }

        return events.sorted { $0.dtstart < $1.dtstart }
    }

    private func unfold(_ text: String) -> String {
        let clean = text.replacingOccurrences(of: "\r\n", with: "\n")
        var result = ""
        let lines = clean.components(separatedBy: "\n")
        for line in lines {
            if line.hasPrefix(" ") || line.hasPrefix("\t") {
                result.append(String(line.dropFirst()))
            } else {
                if !result.isEmpty { result.append("\n") }
                result.append(line)
            }
        }
        return result
    }

    private func parseDate(_ dateStr: String?) -> Date? {
        guard let str = dateStr?.trimmingCharacters(in: .whitespacesAndNewlines), !str.isEmpty else {
            return nil
        }

        // Format 1: 20261001T080000Z
        let isoFormatter = DateFormatter()
        isoFormatter.locale = Locale(identifier: "en_US_POSIX")
        isoFormatter.timeZone = TimeZone(secondsFromGMT: 0)

        if str.hasSuffix("Z") {
            isoFormatter.dateFormat = "yyyyMMdd'T'HHmmss'Z'"
            if let date = isoFormatter.date(from: str) { return date }
        }

        // Format 2: 20261001T080000
        let localFormatter = DateFormatter()
        localFormatter.locale = Locale(identifier: "en_US_POSIX")
        localFormatter.timeZone = TimeZone(identifier: "Europe/Paris") ?? .current
        localFormatter.dateFormat = "yyyyMMdd'T'HHmmss"
        if let date = localFormatter.date(from: str) { return date }

        // Format 3: 20261001
        localFormatter.dateFormat = "yyyyMMdd"
        return localFormatter.date(from: str)
    }

    private func buildEvent(from fields: [String: String]) -> ScheduleEvent? {
        guard let startStr = fields["DTSTART"],
              let endStr = fields["DTEND"],
              let startDate = parseDate(startStr),
              let endDate = parseDate(endStr) else {
            return nil
        }

        let summary = fields["SUMMARY"] ?? "Cours sans titre"
        let location = fields["LOCATION"] ?? ""
        let description = fields["DESCRIPTION"] ?? ""
        let uid = fields["UID"] ?? UUID().uuidString

        // Extraction titre propre, enseignant, sous-groupe
        let cleanTitle = extractCleanTitle(summary: summary)
        let teacher = extractTeacher(description: description)
        let room = extractRoom(location: location, summary: summary, description: description)
        let subGroup = extractSubGroup(summary: summary, description: description)
        let category = detectCategory(summary: summary, description: description)

        return ScheduleEvent(
            id: uid,
            summary: summary,
            cleanTitle: cleanTitle,
            category: category,
            dtstart: startDate,
            dtend: endDate,
            location: location,
            room: room,
            teacher: teacher,
            subGroup: subGroup,
            descriptionText: description
        )
    }

    private func extractCleanTitle(summary: String) -> String {
        var title = summary
        let patterns = [
            "\\b(CM|TD|TP|EXAM|DS|PROJET)\\b",
            "\\bL[1-3]\\s+MATHS[\\w\\s-]*",
            "\\bGROUPE\\s+\\d+([.-]\\d+)?",
            "\\bTD\\d+([.-]\\d+)?",
            "\\bGR\\d+([.-]\\d+)?"
        ]
        for pattern in patterns {
            if let regex = try? NSRegularExpression(pattern: pattern, options: .caseInsensitive) {
                title = regex.stringByReplacingMatches(in: title, range: NSRange(location: 0, length: title.utf16.count), withTemplate: "")
            }
        }
        title = title.replacingOccurrences(of: " - ", with: " ")
        title = title.replacingOccurrences(of: "_", with: " ")
        title = title.trimmingCharacters(in: .whitespacesAndNewlines)
        return title.isEmpty ? summary : title
    }

    private func extractRoom(location: String, summary: String, description: String) -> String {
        let combined = "\(location) \(summary) \(description)"
        if let regex = try? NSRegularExpression(pattern: "\\b([A-F]\\d{3})\\b", options: .caseInsensitive),
           let match = regex.firstMatch(in: combined, range: NSRange(location: 0, length: combined.utf16.count)),
           let range = Range(match.range(at: 1), in: combined) {
            return String(combined[range]).uppercased()
        }
        if combined.lowercased().contains("barbeaux") { return "Amphi Barbeaux" }
        if combined.lowercased().contains("souriau") { return "Amphi Souriau" }
        if !location.isEmpty { return location }
        return ""
    }

    private func extractTeacher(description: String) -> String {
        let lines = description.components(separatedBy: "\\n").joined(separator: "\n").components(separatedBy: .newlines)
        for line in lines {
            let t = line.trimmingCharacters(in: .whitespacesAndNewlines)
            if t.lowercased().hasPrefix("prof") || t.lowercased().hasPrefix("ens") || t.lowercased().hasPrefix("enseignant") {
                return t.components(separatedBy: ":").last?.trimmingCharacters(in: .whitespaces) ?? t
            }
        }
        return ""
    }

    private func extractSubGroup(summary: String, description: String) -> String? {
        let combined = "\(summary) \(description)"
        if let regex = try? NSRegularExpression(pattern: "\\b(?:TD|TP|GR|GROUPE)?\\s*(\\d+-\\d+)\\b", options: .caseInsensitive),
           let match = regex.firstMatch(in: combined, range: NSRange(location: 0, length: combined.utf16.count)),
           let range = Range(match.range(at: 1), in: combined) {
            return String(combined[range])
        }
        return nil
    }

    private func detectCategory(summary: String, description: String) -> CourseCategory {
        let text = "\(summary) \(description)".lowercased()
        if text.contains("ds") || text.contains("exam") || text.contains("partiel") || text.contains("contrôle") || text.contains("évaluation") {
            return .exam
        }
        if text.contains("tp") || text.contains("machine") || text.contains("labo") {
            return .tp
        }
        if text.contains("td") || text.contains("dirigé") {
            return .td
        }
        if text.contains("cm") || text.contains("magistral") || text.contains("cours") {
            return .cm
        }
        if text.contains("projet") || text.contains("soutenance") {
            return .projet
        }
        return .autre
    }
}
