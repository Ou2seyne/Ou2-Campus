import Foundation

public struct ScheduleEvent: Identifiable, Codable, Hashable, Sendable {
    public let id: String
    public let summary: String
    public let cleanTitle: String
    public let category: CourseCategory
    public let dtstart: Date
    public let dtend: Date
    public let location: String
    public let room: String
    public let teacher: String
    public let subGroup: String?
    public let descriptionText: String

    public init(
        id: String,
        summary: String,
        cleanTitle: String,
        category: CourseCategory,
        dtstart: Date,
        dtend: Date,
        location: String,
        room: String,
        teacher: String,
        subGroup: String? = nil,
        descriptionText: String = ""
    ) {
        self.id = id
        self.summary = summary
        self.cleanTitle = cleanTitle
        self.category = category
        self.dtstart = dtstart
        self.dtend = dtend
        self.location = location
        self.room = room
        self.teacher = teacher
        self.subGroup = subGroup
        self.descriptionText = descriptionText
    }

    public var durationMinutes: Int {
        max(0, Int(dtend.timeIntervalSince(dtstart) / 60))
    }

    public var durationFormatted: String {
        let hours = durationMinutes / 60
        let mins = durationMinutes % 60
        if hours > 0 && mins > 0 {
            return "\(hours)h\(String(format: "%02d", mins))"
        } else if hours > 0 {
            return "\(hours)h"
        }
        return "\(mins) min"
    }

    public var timeFormatted: String {
        let formatter = DateFormatter()
        formatter.locale = Locale(identifier: "fr_FR")
        formatter.dateFormat = "HH:mm"
        return "\(formatter.string(from: dtstart)) → \(formatter.string(from: dtend))"
    }

    public var startDateFormatted: String {
        let formatter = DateFormatter()
        formatter.locale = Locale(identifier: "fr_FR")
        formatter.dateFormat = "EEEE d MMMM"
        return formatter.string(from: dtstart).capitalized
    }

    public var startTimeFormatted: String {
        let formatter = DateFormatter()
        formatter.locale = Locale(identifier: "fr_FR")
        formatter.dateFormat = "HH:mm"
        return formatter.string(from: dtstart)
    }

    public var endTimeFormatted: String {
        let formatter = DateFormatter()
        formatter.locale = Locale(identifier: "fr_FR")
        formatter.dateFormat = "HH:mm"
        return formatter.string(from: dtend)
    }

    public func isOngoing(at date: Date = Date()) -> Bool {
        date >= dtstart && date <= dtend
    }

    public func isPast(at date: Date = Date()) -> Bool {
        date > dtend
    }

    public func isUpcoming(at date: Date = Date()) -> Bool {
        date < dtstart
    }

    public func progress(at date: Date = Date()) -> Double {
        guard isOngoing(at: date) else {
            return isPast(at: date) ? 1.0 : 0.0
        }
        let total = dtend.timeIntervalSince(dtstart)
        guard total > 0 else { return 0 }
        let elapsed = date.timeIntervalSince(dtstart)
        return min(1.0, max(0.0, elapsed / total))
    }

    public func minutesRemaining(at date: Date = Date()) -> Int {
        guard isOngoing(at: date) else { return 0 }
        return max(0, Int(dtend.timeIntervalSince(date) / 60))
    }
}
